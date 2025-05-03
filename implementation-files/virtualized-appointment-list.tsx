import React, { useState, useEffect } from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
}

interface VirtualizedAppointmentListProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  className?: string;
}

export const VirtualizedAppointmentList: React?.FC<VirtualizedAppointmentListProps> = ({
  appointments,
  onSelectAppointment,
  className = '',
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedId(appointment?.id);
    onSelectAppointment(appointment);
  };

  const AppointmentRow = ({ index, style }: { index: number, style: React?.CSSProperties }) => {
    const appointment = appointments[index];
    const isSelected = selectedId === appointment?.id;
    
    return (
      <div 
        style={style}
        className={`p-4 border-b ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
        onClick={() => handleSelectAppointment(appointment)}
        role="button"
        tabIndex={0}
        aria-selected={isSelected}
        data-testid="appointment-row"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{appointment?.clientName}</h3>
            <p className="text-sm text-gray-500">{appointment?.serviceName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">{appointment?.date} at {appointment?.time}</p>
            <span 
              className={`inline-block px-2 py-1 text-xs rounded-full ${
                appointment?.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : appointment?.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {appointment?.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-96 ${className}`}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={appointments?.length}
            itemSize={80}
            overscanCount={5}
          >
            {AppointmentRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
};
