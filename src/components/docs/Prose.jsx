import clsx from 'clsx'

export function Prose({ as: Component = 'div', className, ...props }) {
  return (
    <Component
      className={clsx(
        className,
        'prose max-w-none prose-invert text-slate-300',
        // headings
        'prose-headings:scroll-mt-28 prose-headings:font-display prose-headings:font-normal lg:prose-headings:scroll-mt-[8.5rem]',
        // lead
        ' prose-lead:text-slate-400',
        // links
        'prose-a:font-semibold prose-a:text-teal-400',
        // link underline
        'prose-a:no-underline [--tw-prose-background:theme(colors.slate.900)] prose-a:shadow-[inset_0_calc(-1*var(--tw-prose-underline-size,2px))_0_0_var(--tw-prose-underline,theme(colors.sky.800))] hover:prose-a:[--tw-prose-underline-size:6px]',
        // pre
        'prose-pre:rounded-xl prose-pre:bg-slate-900 prose-pre:bg-slate-800/60 prose-pre:shadow-none prose-pre:ring-1 prose-pre:ring-slate-300/10',
        // hr
        'prose-hr:border-slate-800',
        // images
        'prose-img:rounded-lg prose-img:mx-auto',
      )}
      {...props}
    />
  )
}
