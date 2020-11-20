import React from 'react'

type P = {
    children: React.ReactNode
    className?: string
}
const Page: React.FC<P> = ({children, className=''}) => {
    return (
        <div className={`content__area ${className}`}>
            {children}
        </div>)
}

export default Page