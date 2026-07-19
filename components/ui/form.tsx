import * as React from "react";

const Form = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ ...props }, ref) => {
  return <form ref={ref} {...props} />;
});
Form.displayName = "Form";

export { Form };
