import type { MultiValue } from 'react-select';
import type { IInputErrors, ISelect } from '../global/interfaces';

export const setMultiSelectState = (
  setState: React.Dispatch<React.SetStateAction<readonly ISelect[]>>,
  setError: React.Dispatch<React.SetStateAction<IInputErrors>>,
  propertyName: keyof IInputErrors,
  items: MultiValue<ISelect> | null | undefined,
) => {
  const values: readonly ISelect[] = items ?? [];
  setState(values);

  setError((prev) => ({
    ...prev,
    [propertyName]: values.length <= 0,
  }));
};
