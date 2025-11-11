import React from 'react';

type Props = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };

const PixiMountPoint = React.forwardRef<HTMLDivElement, Props>(function PixiMountPoint(
  { children, className, style, ...rest },
  ref
) {
  return (
    <div ref={ref} className={className} style={style} {...rest}>
      {children}
    </div>
  );
});

export default PixiMountPoint;
