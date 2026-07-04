import type { SingleValue } from 'react-select';
import type { IInputErrors, ISelect } from '../global/interfaces';

export const setSingleSelectState = (
  setState: (value: React.SetStateAction<any>) => void,
  setError: (error: React.SetStateAction<IInputErrors>) => void,
  propertyName: keyof IInputErrors,
  item: SingleValue<ISelect>
) => {
  let err: IInputErrors = {};
  setState(item?.value ?? '');
  if (item?.value !== '') {
    err[propertyName] = false;
    setError((prevErrors) => ({
      ...prevErrors,
      ...err,
    }));
  }
};
