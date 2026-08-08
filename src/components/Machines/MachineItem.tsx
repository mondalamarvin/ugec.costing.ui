import { useState } from 'react';
import { GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

interface MachineItemProps {
  machine: any;
  index: number;
  match: any;
  dragHandleProps: any;
}

export const MachineItem = ({
  machine,
  index,
  match,
  dragHandleProps,
}: MachineItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className='bg-white border border-gray-200 rounded-md mb-2 shadow-sm p-3 transition-all'>
      {/* --- TOP ROW (ALWAYS VISIBLE) --- */}
      <div className='flex items-center justify-between'>
        {/* Left Side: Drag Handle, Index, Machine Name */}
        <div className='flex items-center gap-3'>
          <button
            type='button'
            {...dragHandleProps.attributes}
            {...dragHandleProps.listeners}
            className='cursor-grab text-gray-400 hover:text-gray-600 p-1'
          >
            <GripVertical className='w-4 h-4' />
          </button>

          <span className='font-bold text-gray-700'>{index + 1}</span>

          <span className='font-semibold text-gray-800'>{machine.name}</span>

          {match && (
            <span className='text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full'>
              Calculated
            </span>
          )}
        </div>

        {/* Right Side: Metrics + Expansion Toggle */}
        {match ? (
          <div className='flex items-center gap-3 text-sm'>
            <div className='text-right'>
              <span className='text-xs text-gray-400 block uppercase font-medium'>
                Overhead
              </span>
              <span className='font-bold text-gray-800'>
                {'\u20B1'}
                {match.machineOverheadCost?.toLocaleString() ?? 0}
              </span>
            </div>
            {/* Chevron Toggle Button */}
            <button
              type='button'
              onClick={() => setIsExpanded(!isExpanded)}
              className='p-1.5 ml-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors'
              title={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? (
                <ChevronUp className='w-4 h-4' />
              ) : (
                <ChevronDown className='w-4 h-4' />
              )}
            </button>
          </div>
        ) : (
          <span className='text-xs text-gray-400 italic'>
            Pending calculation
          </span>
        )}
      </div>

      {/* --- EXPANDABLE BOTTOM DETAILS SECTION --- */}
      {isExpanded && match && (
        <div className='mt-3 pt-3 border-t border-gray-100 bg-gray-50 rounded-md p-3 text-xs'>
          <p className='font-semibold text-gray-600 mb-2'>
            Calculation Breakdown
          </p>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            <div>
              <span className='text-gray-400 block'>Meters to Run</span>
              <span className='font-semibold text-gray-700'>
                {match.totalMachineRun ?? 0}
              </span>
            </div>
            <div>
              <span className='text-gray-400 block'>Speed</span>
              <span className='font-semibold text-gray-700'>
                ${match.hourlyRate?.toLocaleString() ?? 0}/hr
              </span>
            </div>
            <div>
              <span className='text-gray-400 block'>Set Up</span>
              <span className='font-semibold text-gray-700'>
                ${match.wasteCost?.toLocaleString() ?? 0}
              </span>
            </div>
            <div>
              <span className='text-gray-400 block'>Total Hours</span>
              <span className='font-semibold text-gray-700'>
                {match.estimatedTimeHours} hrs
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
