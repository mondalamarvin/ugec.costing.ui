import { ChevronDown, ChevronUp, Trash, Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatNumber } from '@/lib';

export const PackagingItem = ({
  item,
  index,
  isComputed,
  isPackExpanded,
  onToggle,
  onDelete,
  onDeleteComponent,
  onAddComponent,
}: {
  item: any;
  index: number;
  isComputed: boolean;
  isPackExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onDeleteComponent: (componentIndex: number) => void;
  onAddComponent: () => void;
}) => {
  const componentsTotal = item.components.reduce(
    (sum: number, component: any) => sum + (component.totalCost || 0),
    0,
  );
  return (
    <div
      className={`bg-gray-50 border border-gray-200 shadow-sm mb-2 overflow-hidden ${
        isPackExpanded ? 'rounded-md' : 'rounded-md'
      }`}
    >
      {/* Header */}
      <div className='p-3 flex justify-between items-center hover:bg-gray-100'>
        <div className='transition-all font-semibold'>
          <span className='p-2'>{index + 1}</span>
          {item.name}
        </div>

        <div className='flex items-center gap-3 text-sm'>
          {isComputed ? (
            <>
              <span className='text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full'>
                Calculated
              </span>
              <div className='text-right'>
                <span className='text-xs text-gray-400 block uppercase font-medium'>
                  Total Cost
                </span>
                <span className='font-bold text-gray-800'>
                  {'\u20B1'}
                  {formatNumber(item.totalCost, 2) ?? 0}
                </span>
              </div>

              <div className='w-7 flex justify-center'>
                {item.components.length > 0 && (
                  <button
                    type='button'
                    onClick={onToggle}
                    className='p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors'
                    title={
                      isPackExpanded ? 'Collapse details' : 'Expand details'
                    }
                  >
                    {isPackExpanded ? (
                      <ChevronUp className='w-4 h-4' />
                    ) : (
                      <ChevronDown className='w-4 h-4' />
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <span className='text-xs italic text-gray-400'>
                Pending Calculation
              </span>
              <div className='w-7 flex justify-center'>
                {item.components.length > 0 && (
                  <button
                    type='button'
                    onClick={onToggle}
                    className='p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors'
                    title={
                      isPackExpanded ? 'Collapse details' : 'Expand details'
                    }
                  >
                    {isPackExpanded ? (
                      <ChevronUp className='w-4 h-4' />
                    ) : (
                      <ChevronDown className='w-4 h-4' />
                    )}
                  </button>
                )}
              </div>
            </>
          )}
          <div className='w-7 shrink-0 flex justify-center'>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={() => onAddComponent()}
                  className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
                  title='Add Component'
                >
                  <Plus className='w-4 h-4 text-green-500' />
                </button>
              </TooltipTrigger>

              <TooltipContent>
                <p>Add Component</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className='w-7 flex justify-center'>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={onDelete}
                  className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
                  title='Delete item'
                >
                  <Trash className='w-4 h-4 text-red-500' />
                </button>
              </TooltipTrigger>

              <TooltipContent>
                <p>Delete Item</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {item.components.length > 0 && isPackExpanded && (
        <div className='border-t border-gray-200 bg-white p-3 text-xs'>
          <p className='text-sm font-semibold text-gray-600 mb-2'>
            Packaging Components
          </p>

          {item.components.map((component: any, componentIndex: number) => (
            <div
              key={componentIndex}
              className='flex items-center text-sm p-1.5'
            >
              <span className='flex-1 text-gray-700'>{component.name}</span>
              {isComputed ? (
                <span className='text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full'>
                  Calculated
                </span>
              ) : (
                <span className='text-xs italic text-gray-400'>
                  Pending Calculation
                </span>
              )}
              <span className='w-25 text-right font-semibold text-gray-700'>
                {'\u20B1'}
                {formatNumber(component.totalCost, 2)}
              </span>

              {/* Reserve space for chevron and trash */}
              <div className='w-7 shrink-0' />
              <div className='w-7 shrink-0 flex justify-center'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type='button'
                      onClick={() => onDeleteComponent(componentIndex)}
                      className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
                      title='Delete item'
                    >
                      <Trash className='w-4 h-4 text-red-500' />
                    </button>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Delete Item</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className='w-7 shrink-0' />
            </div>
          ))}

          <div className='flex items-center text-sm p-1.5 border-t border-gray-100 mt-1'>
            <span className='flex-1 text-right font-semibold text-gray-600'>
              Total Cost
            </span>

            <span className='w-25 text-right font-bold text-gray-800'>
              {'\u20B1'}
              {formatNumber(componentsTotal, 2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
