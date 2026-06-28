import React, { useEffect } from 'react'
import useAuth from '../../Auth/hooks/useAuth'
import { Navigate } from 'react-router-dom'
import Loader from './Loader'
import LineLoader from './LineLoader'
import useMovies from '../../Movies/hooks/useMovies'

const Public = ({children}) => {
  const {authLoading,user,handleGetMe} = useAuth()
  const {loading} = useMovies()

  useEffect(()=>{
     handleGetMe()
  },[])

  if (authLoading || loading) {
    return (
      <LineLoader />
    );
  }

  if(user){
    return <Navigate to="/browse"/>
  }

  return children
}

export default Public
