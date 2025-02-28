import { useState } from "react"
import { useAuth } from "../context/AuthContext"

export default function Authentication(props){
    const { handleCloseModal } = props
    const [isRegistration, setIsRegistration] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [error, setError] = useState(null)

    // We have the ability to destructure props from the global hook we created 
    const { signup, login } = useAuth()

    async function handleAuthenticate() {
        // Guard Clause
        if (!email || !email.includes('@') || !password || password.length < 6 || isAuthenticating){
            return
        }

        try {
            setIsAuthenticating(true)
            setError(null)
            if (isRegistration){
                // Register a user
                await signup(email, password)
            } else {
                // Login a user
                await login(email, password)
            }
            handleCloseModal()
        } catch (err) {
            console.log(err.message)
            setError(err.message)
        } finally {
            setIsAuthenticating(false)
        }



    }

    return(
        <>
          
            <>
                <h2 className="sign-up-text"> {isRegistration ? "Sign Up" : "Sign in"} </h2>
                <p>{isRegistration ? "Register your account!" : "Login to your account"} </p>
            </>

            {error && (
                <p>
                    ❌{error}
                </p>
            )}
        

            <input placeholder = "Email"  value={email} onChange = {(e)=>setEmail(e.target.value)}/>
            <input placeholder= "*********" type="password" value={password} onChange = {(e)=>setPassword(e.target.value)}/>
            <button onClick = {handleAuthenticate}><p>{isAuthenticating ? "Authenticating..." : "Submit"}</p></button>
            <hr/>

            <div className="register-content">
                <p> {isRegistration ? "Already have an account?" : "Don't have an account ?"}</p>
                <button onClick={()=>setIsRegistration(!isRegistration)}><p>{isRegistration ? "Login" : "Sign Up"}</p></button>
            </div>
        
        </>

        
      
    )
}