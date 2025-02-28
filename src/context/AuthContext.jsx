
// Context is like a global state
// Removes the need to pass the state between props

import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {useState, useEffect, useContext, createContext } from 'react'
import { auth, db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'
const AuthContext = createContext()

// Creates a custom hook where we can de-structure out any of the value global props
export function useAuth(){
    return useContext(AuthContext)
}

export function AuthProvider(props){
    const {children} = props
    const [globalUser, setGlobalUser ] = useState(null)
    const [globalData, setGlobalData] = useState(null)
    const [isLoading,  setIsLoading] = useState(false)



    function signup(email, password){
        return createUserWithEmailAndPassword(auth, email, password)
    }

    function login(email, password){
        return signInWithEmailAndPassword(auth, email, password)
    }
    
    function resetPassword(email){
        return sendPasswordResetEmail(auth, email)
    }

    function logout(){
        setGlobalUser(null)
        setGlobalData(null)
        return signOut(auth)
    }

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, async (user) => { 
            //console.log("CURRENT USER: ", user) // REMOVE WHEN WE DEPLOY
            // if there's no user, empty the use state and retrun from this listner
            if (!user) {
                console.log("No active user")
                return
                }

            setGlobalUser(user)

            // if there is a user, then check if the user has data in the database, and if they do, then fetch said data and update the global state
            try{
                setIsLoading(true)

                // first we create a reference for the document, and then we get the doc, and then we snapshot it to see if there's anything there
                const docRef = doc(db, 'users', user.uid)
                const docSnap = await getDoc(docRef)

                let firebaseData = {}
                if (docSnap.exists()){
                    firebaseData = docSnap.data()
                    console.log("Found user data: ", firebaseData)

                }
                setGlobalData(firebaseData)
            }catch (err) {
                console.log(err.message)
            }finally{
                setIsLoading(false)

            }
        })
        return unsubscribe

    },[]) // Empty so juse a useEffect when the page loads for the first time


    // This value is going to hold our global state props we want to access from anywhere
    const value = {globalUser, globalData, setGlobalData, isLoading, signup, login, logout}


    return (
        <AuthContext.Provider value = {value}>
            {children}
        </AuthContext.Provider>
    )
}