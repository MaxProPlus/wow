import React from 'react'

const Page: React.FC = ({children}) => {
    return (
        <div className="content__area">
            {children}
        </div>)
}

export default Page