import type { ChangeEvent } from 'react';
import type { IInputErrors } from '../global/interfaces';

export const setInputState = (
  e: ChangeEvent<HTMLInputElement>,
  setState: (value: React.SetStateAction<any>) => void,
  setError: (error: React.SetStateAction<IInputErrors>) => void,
  propertyName: keyof IInputErrors
) => {
  let err: IInputErrors = {};
  setState(e.target.value);
  if (parseFloat(e.target.value) > 0) {
    err[propertyName] = false;
    setError((prevErrors) => ({
      ...prevErrors,
      ...err,
    }));
  }
};
