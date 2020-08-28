import React from "react"
import styles from "./PageTitle.module.scss"

type P = {
    icon: any
    title: string
    children?: any
    className?: any
}
const PageTitle = ({title, icon, children, className}: P) => {

    let bodyClass = styles.body
    if (!!className) {
        bodyClass += ' ' + className
    }



    return (
        <div className={bodyClass}>
                <h1>
                    <img src={icon} alt=""/>
                    <span>{title}</span>
                </h1>
                <div className="d-flex justify-content-end">
                    {children}
                </div>
        </div>
    )
}

export default PageTitle