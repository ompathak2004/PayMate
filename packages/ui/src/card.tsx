export const Card = ({
  title,
  children
}: {
  title: string,
  children?: React.ReactNode
}): JSX.Element =>{
  return (
    <div className="border pg-4">
      <h1 className="text-xl border-b pb-2">
        {title}
      </h1>
      {children}
    </div>
  )
}