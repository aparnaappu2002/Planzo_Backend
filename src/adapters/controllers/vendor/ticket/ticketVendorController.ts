import { Request, Response } from "express";
import { IticketAndUserDetailsOfEventUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/ticket/ticketAndUserDetailsOfEventUseCase";
import { HttpStatus } from "../../../../domain/enums/httpStatus";
import { IticketVerificationUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/ticket/IticketVerificationUseCase";
import { IticketSearchUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/ticket/IticketSearchUseCase";
import { IticketFilterUseCase } from "../../../../domain/interfaces/useCaseInterfaces/vendor/ticket/IticketFilterUseCase";
export class TicketVendorController {
    private ticketAndUserDetailsUseCase: IticketAndUserDetailsOfEventUseCase
    private ticketVerificationUseCase:IticketVerificationUseCase
    private ticketSearchUseCase:IticketSearchUseCase
    private ticketFilterUseCase:IticketFilterUseCase
    constructor(ticketAndUserDetailsUseCase: IticketAndUserDetailsOfEventUseCase,ticketVerificationUseCase:IticketVerificationUseCase,ticketSearchUseCase:IticketSearchUseCase,ticketFilterUseCase:IticketFilterUseCase) {
        this.ticketAndUserDetailsUseCase = ticketAndUserDetailsUseCase
        this.ticketVerificationUseCase=ticketVerificationUseCase
        this.ticketSearchUseCase=ticketSearchUseCase
        this.ticketFilterUseCase=ticketFilterUseCase
    }
    async handleTicketAndUserDetails(req: Request, res: Response): Promise<void> {
        try {
            const {vendorId, pageNo } = req.query
            const page = parseInt(pageNo as string, 10) || 1
            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: 'vendor id is missing' })
                return
            }
            const { ticketAndEventDetails, totalPages } = await this.ticketAndUserDetailsUseCase.findTicketAndUserDetailsOfEvent(vendorId?.toString(), page)
            res.status(HttpStatus.OK).json({ message: "Ticket and user details", ticketAndEventDetails, totalPages })
        } catch (error) {
            console.log('error while fetching the ticket and user details of the event', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while fetching the ticket and user details of the event',
                error: error instanceof Error ? error.message : 'error while fetching the ticket and user details of the event'
            })
        }
    }
    async handleTicketConfirmation(req: Request, res: Response): Promise<void> {
        try {
            const { ticketId, eventId } = req.body
            const vendorId = (req as any).user.userId
            console.log('This is event id in controller', eventId)
            const verifiedTicket = await this.ticketVerificationUseCase.verifyTicket(ticketId, eventId, vendorId)
            res.status(HttpStatus.OK).json({ message: "Ticket verified", verifiedTicket })
        } catch (error) {
            console.log('error while ticket confirming', error)
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "error while ticket confirming",
                error: error instanceof Error ? error.message : 'error while ticket confirming'
            })
        }
    }
    async handleTicketFilter(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, pageNo, paymentStatus, ticketStatus } = req.query;
            const page = parseInt(pageNo as string, 10) || 1;
            
            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: 'vendor id is missing' });
                return;
            }

            if (paymentStatus && !['pending', 'successful', 'failed'].includes(paymentStatus as string)) {
                res.status(HttpStatus.BAD_REQUEST).json({ 
                    message: 'Invalid payment status. Must be: pending, successful, or failed' 
                });
                return;
            }

            if (ticketStatus && !['used', 'refunded', 'unused'].includes(ticketStatus as string)) {
                res.status(HttpStatus.BAD_REQUEST).json({ 
                    message: 'Invalid ticket status. Must be: used, refunded, or unused' 
                });
                return;
            }
            
            const { ticketAndEventDetails, totalPages } = await this.ticketFilterUseCase.filterTickets(
                vendorId.toString(),
                page,
                paymentStatus as 'pending' | 'successful' | 'failed' | undefined,
                ticketStatus as 'used' | 'refunded' | 'unused' | undefined
            );
            
            res.status(HttpStatus.OK).json({ 
                message: "Filtered tickets", 
                ticketAndEventDetails, 
                totalPages 
            });
        } catch (error) {
            console.log('error while filtering tickets', error);
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while filtering tickets',
                error: error instanceof Error ? error.message : 'error while filtering tickets'
            });
        }
    }

    async handleTicketSearch(req: Request, res: Response): Promise<void> {
        try {
            const { vendorId, pageNo, searchTerm } = req.query;
            const page = parseInt(pageNo as string, 10) || 1;
            
            if (!vendorId) {
                res.status(HttpStatus.BAD_REQUEST).json({ message: 'vendor id is missing' });
                return;
            }

            if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
                res.status(HttpStatus.BAD_REQUEST).json({ message: 'search term is required' });
                return;
            }
            
            const { ticketAndEventDetails, totalPages } = await this.ticketSearchUseCase.searchTicketsByEventTitle(
                vendorId.toString(),
                searchTerm.trim(),
                page
            );
            
            res.status(HttpStatus.OK).json({ 
                message: "Search results", 
                ticketAndEventDetails, 
                totalPages 
            });
        } catch (error) {
            console.log('error while searching tickets', error);
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'error while searching tickets',
                error: error instanceof Error ? error.message : 'error while searching tickets'
            });
        }
    }


}