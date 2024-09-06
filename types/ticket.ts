export type TicketType = {
    id: string
    CustomerName: string
    CustomerPhone: string
    source: string
    status: string
    PassportNumber: string
    TicketID: string
    BusNumber: string
    DepartureLocation: string
    ArrivalLocation: string
    DepartureTime: string
    ArrivalTime: string
    PaymentMethod: string
    TicketPrice: number
    CarmaCommission: number
    CarmaAmount: number
    KupiCommission: number
    KupiAmount: number
    totalPrice: number
}