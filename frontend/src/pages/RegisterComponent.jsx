import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import authService from '../services/authService'
import toast from 'react-hot-toast'

const RegisterComponent = () => {
  const navigate = useNavigate()

  const [registerUser, setRegisterUser] = useState({
    name: '',
    password: '',
    email: '',
    confirmPassword: '',
  })

  const HandleSubmit = (e) => {
    e.preventDefault()
    if (registerUser.password != registerUser.confirmPassword) {
      toast.error('Password and confirm pasword shoud be same')
      return
    }
    if (registerUser.email && registerUser.name && registerUser.password) {
      const newUser = {
        username: registerUser.name,
        password: registerUser.password,
        email: registerUser.email,
      }
      authService.register(newUser).then((res) => {
        if (res.success) {
          toast.success(res.message)
          navigate('/auth/login')
        } else {
          toast.error(res.message)
        }
      }).catch((er) => {
        toast.error(er)
      })
    } else {
      toast.error('Please fill all the fields')
    }
  }

  return (
    <div className="h-full w-full flex flex-row justify-center items-start">
      <form className="flex flex-col mt-[14%] gap-4 bg-white p-[20px] rounded-[8px] shadow-[0_0px_10px_0px_rgba(0,0,0,0.2)] w-80" onSubmit={(e) => HandleSubmit(e)}>
        <h2 className="font-bold text-xl">Register</h2>
        <input
          className="bg-gray-50 font-semibold border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="text"
          placeholder="Username"
          value={registerUser.name}
          onChange={(e) => setRegisterUser({ ...registerUser, name: e.target.value })}
          required
        />
        <input
          className="bg-gray-50 font-semibold border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="email"
          placeholder="Email"
          value={registerUser.email}
          onChange={(e) => setRegisterUser({ ...registerUser, email: e.target.value })}
          required
        />
        <input
          className="bg-gray-50 font-semibold border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-4"
          type="password"
          placeholder="Password"
          value={registerUser.password}
          onChange={(e) => setRegisterUser({ ...registerUser, password: e.target.value })}
        />
        <input
          className="bg-gray-50 font-semibold border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="password"
          placeholder="Confirm password"
          value={registerUser.confirmPassword}
          onChange={(e) => setRegisterUser({ ...registerUser, confirmPassword: e.target.value })}
        />

        <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-4" type="submit">
          Register
        </button>
        <Link className="text-blue-600 hover:underline dark:text-blue-500 " to="/auth/login">
          Already have an Account?
        </Link>
      </form>
    </div>
  )
}

export default RegisterComponent
