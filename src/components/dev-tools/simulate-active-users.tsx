'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Loader } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { simulateActiveUsers } from '@/actions/dev-tools/simulate-active-users';
import { toast } from '@/components/ui/use-toast';
import useTotalUsers from './useTotalUsers';

export default function SimulateActiveUsers() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [percentageDataChanged, setPercentageDataChanged] = useState(0.01);
  const [isSimulating, setIsSimulating] = useState(false);

  const { data: totalUsers, isLoading: isTotalUsersLoading } = useTotalUsers();

  // New query for simulation
  useQuery({
    queryKey: ['simulateActiveUsers'],
    queryFn: async () => {
      const { count, error } = await simulateActiveUsers({
        numToSimulate: activeUsers,
        percentageDataChanged,
      });
      if (error) {
        toast({
          title: 'Simulation Error',
          description: `Updated ${count} active users. But got error: ${error}`,
        });
      } else {
        toast({
          title: 'Simulation Success',
          description: `${count} active users simulated with ${Math.floor(count * percentageDataChanged)} users changing data`,
        });
      }
      return count;
    },

    refetchInterval: isSimulating ? 5000 : false,
    enabled: isSimulating,
  });

  const handleSimulate = async () => {
    setIsSimulating(true);
  };

  const handleCancel = () => {
    setIsSimulating(false);
  };

  if (isTotalUsersLoading) {
    return <Loader />;
  }

  if (!totalUsers) {
    return <div>No users found</div>;
  }

  return (
    <div className='w-full space-y-4'>
      <h2 className='text-lg font-semibold'>
        {isSimulating ? (
          <div className='flex items-center'>
            <Loader className='mr-2 h-4 w-4 animate-spin' />
            <span>Simulating Active Users (total users: {totalUsers})</span>
          </div>
        ) : (
          <>Simulate Active Users (total users: {totalUsers})</>
        )}
      </h2>
      <Slider
        min={0}
        max={totalUsers}
        step={1}
        value={[activeUsers]}
        onValueChange={(value: number[]) => setActiveUsers(value[0])}
      />
      <div className='flex items-center justify-between'>
        <span>{activeUsers} users selected</span>
        <div className='flex items-center space-x-2'>
          <Input
            type='number'
            min={0}
            max={100}
            step={1}
            value={percentageDataChanged * 100}
            onChange={(e) =>
              setPercentageDataChanged(Number(e.target.value) / 100)
            }
            className='w-20'
          />
          <span>% active users changing data</span>
        </div>
      </div>
      <Button
        onClick={isSimulating ? handleCancel : handleSimulate}
        disabled={activeUsers === 0}
        variant={isSimulating ? 'destructive' : 'default'}
      >
        {isSimulating ? (
          <>Cancel Active User Simulation</>
        ) : (
          `Simulate ${activeUsers} Active Users`
        )}
      </Button>
    </div>
  );
}
