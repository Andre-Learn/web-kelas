import { m } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

const variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay } }),
};

/** Fades content up once as it enters the viewport. */
export function Reveal({ as = 'div', children, delay = 0, className, ...rest }) {
  const Tag = m[as] ?? m.div;
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={variants}
      custom={delay}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const groupVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

/** Staggers direct RevealItem children. */
export function RevealGroup({ as = 'div', children, className, ...rest }) {
  const Tag = m[as] ?? m.div;
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      variants={groupVariants}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ as = 'div', children, className, ...rest }) {
  const Tag = m[as] ?? m.div;
  return (
    <Tag className={className} variants={variants} {...rest}>
      {children}
    </Tag>
  );
}
