export const Center = ({
    children
} :{
    children: React.ReactNode
}): JSX.Element => {
    return (
        // outer div centers vertically and inner div centers horizontally
        <div className="flex justify-center flex-col h-full">
            <div className="flex justify-center">
            {children}
            </div>
        </div>
    )
}