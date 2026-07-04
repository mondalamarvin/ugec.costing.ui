import type { IForm } from "../../global/interfaces/IForm";

export const Form = ({ children, onSubmit, className }: IForm) => {
  return (
    <form className={className} onSubmit={onSubmit}>
      {children}
    </form>
  );
};
