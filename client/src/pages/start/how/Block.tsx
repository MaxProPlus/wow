import React, {FC} from "react"
import styles from './Block.module.scss'

type P = {
    children: any
    title: string
    icon: any
}

const Block: FC<P> = ({icon, title, children}) => {


    return (
        <>
            <h3 className={styles.title}><img src={icon} alt=""/>{title}</h3>
            <div className={styles.description}>
                {children}
            </div>
        </>
    )

}

export default Block