export const customErrorStyle = (
  propertyName: string,
  value: boolean | undefined
) => {
  const isError = value !== undefined && value === true;
  return {
    control: (baseStyles: any) => ({
      ...baseStyles,
      borderColor: propertyName && isError ? '#ef4444' : '',
      backgroundColor: propertyName && isError ? '#fef2f2' : '',
      color: propertyName && isError ? '#7f1d1d' : '',
    }),
  };
};
