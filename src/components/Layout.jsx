import { useState } from "react"
import Authentication from "./Authentication"
import Modal from "./Modal"
import { useAuth } from "../context/AuthContext"

export default function Layout(props) {
    const { children, isAuthenticated } = props
    const [showModal, setShowModal] = useState(false)

    const { globalUser, logout } = useAuth()


    const header = (
        <header>
            <div>
                <h1 className="text-gradient"> UpOnly </h1>
                <p>For finance tracking</p>
            </div>
        {globalUser ? (
            <button onClick={logout}>
                <p> Logout </p>
            </button>

        ):(            
            <button onClick={()=>setShowModal(true)}>
                <p> Sign up free</p>
                <i className="fa-solid fa-money-bill-trend-up"></i>
            </button>)}
            
        </header>
    )

    const footer = (
        <footer>
            <p> 
                <span className="text-gradient">UpOnly</span> was made by <a href = "https://www.youtube.com/watch?v=xvFZjo5PgG0" target = "_blank"> Derin Karas</a> 
            </p>
            <p>
                Track your finances with ease
            </p>
        </footer>
    )

    function handleCloseModal(){
        setShowModal(false)
    }


    return (
        <>  
        
            {showModal && (<Modal handleCloseModal = {handleCloseModal}>
                <Authentication handleCloseModal = {handleCloseModal} />
            </Modal>)}

            {header}
            <main>
                {children}
            </main>
            {footer}
        </>
    )
}