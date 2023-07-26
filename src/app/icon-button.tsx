import { IconProps } from '@radix-ui/react-icons/dist/types';
import classNames from 'classnames';
import { MouseEventHandler } from 'react';
import styles from './icon-button.module.css';

export default function IconButton({
  icon: Icon,
  onClick,
  className,
}: {
  icon: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<SVGSVGElement>
  >;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}) {
  return (
    <button className={classNames(styles.root, className)} onClick={onClick}>
      <Icon className={styles.icon} />
    </button>
  );
}
