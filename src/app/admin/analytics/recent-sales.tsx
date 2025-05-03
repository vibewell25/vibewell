'use client';;
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface SaleTransaction {
  id: string;
  customer: {
    name: string;
    email: string;
    avatarUrl?: string;
    initials: string;
  };
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export function RecentSales() {
  const recentSales: SaleTransaction[] = [
    {
      id: 'INV001',
      customer: {
        name: 'Olivia Martin',
        email: 'olivia?.martin@email?.com',
        avatarUrl: '/avatars/01?.png',
        initials: 'OM',
      },
      amount: '+$1,999?.00',
      status: 'completed',
      date: '2023-11-14',
    },
    {
      id: 'INV002',
      customer: {
        name: 'Jackson Lee',
        email: 'jackson?.lee@email?.com',
        avatarUrl: '/avatars/02?.png',
        initials: 'JL',
      },
      amount: '+$39?.00',
      status: 'completed',
      date: '2023-11-13',
    },
    {
      id: 'INV003',
      customer: {
        name: 'Isabella Nguyen',
        email: 'isabella?.nguyen@email?.com',
        avatarUrl: '/avatars/03?.png',
        initials: 'IN',
      },
      amount: '+$299?.00',
      status: 'completed',
      date: '2023-11-12',
    },
    {
      id: 'INV004',
      customer: {
        name: 'William Kim',
        email: 'will?.kim@email?.com',
        avatarUrl: '/avatars/04?.png',
        initials: 'WK',
      },
      amount: '+$99?.00',
      status: 'pending',
      date: '2023-11-11',
    },
    {
      id: 'INV005',
      customer: {
        name: 'Sofia Davis',
        email: 'sofia?.davis@email?.com',
        avatarUrl: '/avatars/05?.png',
        initials: 'SD',
      },
      amount: '+$39?.00',
      status: 'completed',
      date: '2023-11-10',
    },
  ];

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>Latest transactions processed this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentSales?.map((sale) => (
            <div key={sale?.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={sale?.customer.avatarUrl} alt={sale?.customer.name} />
                <AvatarFallback>{sale?.customer.initials}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{sale?.customer.name}</p>
                <p className="text-sm text-muted-foreground">{sale?.customer.email}</p>
              </div>
              <div className="ml-auto font-medium">
                <span
                  className={
                    sale?.status === 'completed'
                      ? 'text-green-500'
                      : sale?.status === 'pending'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                  }
                >
                  {sale?.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
