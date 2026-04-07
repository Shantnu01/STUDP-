import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, Building2, User, Phone } from "lucide-react"

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 40 48" {...props}>
    <clipPath id="a"><path d="m0 0h40v48h-40z" /></clipPath>
    <g clipPath="url(#a)">
      <path d="m25.0887 5.05386-3.933-1.05386-3.3145 12.3696-2.9923-11.16736-3.9331 1.05386 3.233 12.0655-8.05262-8.0526-2.87919 2.8792 8.83271 8.8328-10.99975-2.9474-1.05385625 3.933 12.01860625 3.2204c-.1376-.5935-.2104-1.2119-.2104-1.8473 0-4.4976 3.646-8.1436 8.1437-8.1436 4.4976 0 8.1436 3.646 8.1436 8.1436 0 .6313-.0719 1.2459-.2078 1.8359l10.9227 2.9267 1.0538-3.933-12.0664-3.2332 11.0005-2.9476-1.0539-3.933-12.0659 3.233 8.0526-8.0526-2.8792-2.87916-8.7102 8.71026z" />
      <path d="m27.8723 26.2214c-.3372 1.4256-1.0491 2.7063-2.0259 3.7324l7.913 7.9131 2.8792-2.8792z" />
      <path d="m25.7665 30.0366c-.9886 1.0097-2.2379 1.7632-3.6389 2.1515l2.8794 10.746 3.933-1.0539z" />
      <path d="m21.9807 32.2274c-.65.1671-1.3313.2559-2.0334.2559-.7522 0-1.4806-.102-2.1721-.2929l-2.882 10.7558 3.933 1.0538z" />
      <path d="m17.6361 32.1507c-1.3796-.4076-2.6067-1.1707-3.5751-2.1833l-7.9325 7.9325 2.87919 2.8792z" />
      <path d="m13.9956 29.8973c-.9518-1.019-1.6451-2.2826-1.9751-3.6862l-10.95836 2.9363 1.05385 3.933z" />
    </g>
  </svg>
)

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z" />
  </svg>
)

export default function LoginPage() {
  const { login, registerUser, logout } = useAuth()
  const nav = useNavigate()
  
  const [isRegistering, setIsRegistering] = useState(false)
  const [regStatus, setRegStatus] = useState<'idle'|'loading'|'success'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRegStatus('loading')
    setErrorMsg('')
    const fd = new FormData(event.currentTarget)
    const email = (fd.get('email') as string).trim().toLowerCase()
    const password = fd.get('password') as string

    if (!email || !password) {
      setErrorMsg('Please enter your email and password.')
      setRegStatus('idle')
      return
    }

    try {
      await login(email, password)
      // AuthProvider's onAuthStateChanged will fetch the profile and set the role.
      // Navigate to root — ProtectedRoute will redirect to the correct portal
      // based on the role once the profile resolves.
      nav('/', { replace: true })
    } catch (e: any) {
      if (
        e.code === 'auth/invalid-credential' ||
        e.code === 'auth/wrong-password' ||
        e.code === 'auth/user-not-found' ||
        e.message?.toLowerCase().includes('invalid')
      ) {
        setErrorMsg('Invalid email or password. Please try again.')
      } else if (e.code === 'auth/too-many-requests') {
        setErrorMsg('Too many failed attempts. Please wait a moment and try again.')
      } else {
        setErrorMsg('Sign-in failed. Please check your connection and try again.')
      }
      setRegStatus('idle')
    }
  }

  // Registration Handler
  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRegStatus('loading')
    setErrorMsg('')
    
    const fd = new FormData(event.currentTarget)
    const password = fd.get('password') as string
    const confirmPw = fd.get('confirmPw') as string

    if (password !== confirmPw) {
      setErrorMsg('Passwords do not match.')
      setRegStatus('idle')
      return
    }

    const payload = {
      schoolName: fd.get('schoolName') as string,
      city: fd.get('city') as string,
      contactName: fd.get('contactName') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string || '',
      students: 0,    // Admin will set this after approval
      plan: 'None',   // Principal chooses plan after login
      uid: ''
    }

    try {
      const authUser = await registerUser(payload.email, password, payload.contactName)
      payload.uid = authUser.uid
      
      await api.post('/api/registrations', payload)
      setRegStatus('success')
      await logout()
    } catch (e: any) {
      setErrorMsg(e.response?.data?.error || e.message || 'Registration failed. Try again.')
      setRegStatus('idle')
    }
  }

  const SplitScreenLayout = ({ children, isReverse = false }: { children: React.ReactNode, isReverse?: boolean }) => (
    <div className={`flex w-full min-h-screen bg-[#09090b] text-zinc-100 ${isReverse ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Form Content Side */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12 lg:py-0 overflow-y-auto z-10 relative">
        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>
      </div>
      
      {/* Graphic / Image Side */}
      <div className="hidden lg:flex w-[55%] relative items-center justify-center bg-zinc-950 overflow-hidden border-l border-white/5">
         {/* Subtle ambient gradients */}
         <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
         
         <div className="relative z-10 w-full h-full p-12 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10 text-emerald-400 drop-shadow-md" />
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-200">EduSync Ecosystem</span>
            </div>
            
            <div className="max-w-xl mx-auto backdrop-blur-md bg-white/[0.02] border border-white/10 p-10 rounded-3xl shadow-2xl">
              <div className="flex gap-4 items-start mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Centralized Command</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">Experience seamless administrative oversight. Manage attendance, track fees, and unify communications across every department from a single pane of glass.</p>
                </div>
              </div>

              <Separator className="bg-white/10 my-8" />
              
              <div className="flex -space-x-4">
                <img className="w-12 h-12 rounded-full border-2 border-zinc-950 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User" />
                <img className="w-12 h-12 rounded-full border-2 border-zinc-950 object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="User" />
                <img className="w-12 h-12 rounded-full border-2 border-zinc-950 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" />
                <div className="w-12 h-12 rounded-full border-2 border-zinc-950 bg-emerald-600 flex items-center justify-center text-sm font-bold text-white">+5k</div>
              </div>
              <p className="text-sm text-zinc-400 mt-4 font-medium tracking-tight">Trusted by over 5,000 top educational institutions.</p>
            </div>
         </div>
      </div>
    </div>
  )

  if (isRegistering) {
    if (regStatus === 'success') {
      return (
        <SplitScreenLayout isReverse>
           <div className="flex flex-col items-center text-center space-y-6">
             <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={40} className="drop-shadow-lg" />
             </div>
             <div>
               <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Application Received</h2>
               <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
                 Your institution's profile has been safely secured. Our administrative team will review your application and provision access shortly.
               </p>
             </div>
             <Button size="lg" className="w-full mt-6 bg-white text-zinc-950 hover:bg-zinc-200" onClick={() => { setIsRegistering(false); setRegStatus('idle'); }}>
               Return to Login
             </Button>
           </div>
        </SplitScreenLayout>
      )
    }

    return (
      <SplitScreenLayout isReverse>
        <div className="mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Register Institution</h2>
          <p className="text-sm sm:text-base text-zinc-400">Join the EduSync network today.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="schoolName" className="text-zinc-300">School Name</Label>
              <Input id="schoolName" name="schoolName" required placeholder="Oakwood Academy" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-zinc-300">City</Label>
              <Input id="city" name="city" required placeholder="New York" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName" className="text-zinc-300">Principal Name</Label>
            <div className="relative">
               <Input id="contactName" name="contactName" required placeholder="Jane Doe" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50" />
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500"><User size={16} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email address</Label>
              <div className="relative">
                 <Input id="email" name="email" type="email" required placeholder="admin@school.edu" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50" />
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500"><Mail size={16} /></div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">Phone (Optional)</Label>
              <div className="relative">
                 <Input id="phone" name="phone" placeholder="+1..." className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50" />
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500"><Phone size={16} /></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  required
                  type={isVisible ? "text" : "password"}
                  className="pr-10 pl-10 bg-white/5 border-white/10 text-white focus-visible:ring-emerald-500/50"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500"><Lock size={16} /></div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-zinc-500 hover:text-white transition-colors"
                  onClick={() => setIsVisible(!isVisible)}
                >
                  {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPw" className="text-zinc-300">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPw"
                  name="confirmPw"
                  required
                  type={showConfirm ? "text" : "password"}
                  className="pr-10 bg-white/5 border-white/10 text-white focus-visible:ring-emerald-500/50"
                  placeholder="••••••••"
                />
                 <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-zinc-500 hover:text-white transition-colors"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {errorMsg && <div className="text-sm font-medium text-rose-400 bg-rose-400/10 p-3 rounded-md">{errorMsg}</div>}

          <Button size="lg" disabled={regStatus === 'loading'} className="w-full bg-white text-zinc-950 font-semibold hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] mt-4" type="submit">
            {regStatus === 'loading' ? 'Submitting Application...' : 'Register Institution'}
          </Button>
          
          <div className="text-center pt-4">
             <p className="text-sm text-zinc-400">
               Already have an account?{" "}
               <button type="button" onClick={() => setIsRegistering(false)} className="text-white font-medium hover:underline hover:text-white transition-colors">
                 Sign in instead
               </button>
             </p>
          </div>
        </form>
      </SplitScreenLayout>
    )
  }

  // Login View
  return (
    <SplitScreenLayout>
      <div className="mb-10 lg:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
        <p className="text-sm sm:text-base text-zinc-400">
          Sign in to your EduSync dashboard.
        </p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-6">
        <Button type="button" variant="outline" className="w-full justify-center gap-3 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white py-6">
          <GoogleIcon className="h-5 w-5" />
          <span className="font-semibold">Continue with Google</span>
        </Button>

        <div className="flex items-center gap-3 py-2">
          <Separator className="flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">Or use email</span>
          <Separator className="flex-1 bg-white/10" />
        </div>

        <div className="space-y-5">
          <div>
            <Label htmlFor="login-email" className="text-zinc-300">Email Address</Label>
            <div className="relative mt-2">
              <Input
                id="login-email"
                name="email"
                className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 py-6"
                placeholder="admin@edusync.in"
                type="email"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <Mail size={18} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="login-password" className="text-zinc-300">Password</Label>
              <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-colors font-medium">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                name="password"
                className="pl-11 pr-11 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 py-6"
                placeholder="••••••••"
                type={isVisible ? "text" : "password"}
                required
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <Lock size={18} />
              </div>
              <button
                className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-zinc-500 hover:text-white transition-colors outline-none"
                type="button"
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMsg && <div className="text-sm font-medium text-rose-400 bg-rose-400/10 p-3 rounded-md">{errorMsg}</div>}

          <div className="flex items-center gap-3 pt-2 pb-2">
            <Checkbox id="remember-me" className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
            <Label htmlFor="remember-me" className="text-sm text-zinc-400 font-normal cursor-pointer select-none">Keep me signed in for 30 days</Label>
          </div>
        </div>

        <Button size="lg" disabled={regStatus === 'loading'} type="submit" className="w-full bg-white text-zinc-950 font-bold hover:bg-zinc-200 py-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          {regStatus === 'loading' ? 'Authenticating...' : 'Sign In to Dashboard'}
          {!regStatus || regStatus !== 'loading' ? <ArrowRight className="h-5 w-5 ml-2" /> : null}
        </Button>

        <div className="text-center pt-6">
          <p className="text-sm text-zinc-400">
            Don't have an institution account?{" "}
            <button type="button" onClick={() => setIsRegistering(true)} className="text-white font-medium hover:underline hover:text-white transition-colors">
              Request access
            </button>
          </p>
        </div>
      </form>
    </SplitScreenLayout>
  )
}
