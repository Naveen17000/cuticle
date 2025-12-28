"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Lock, Zap, Users, Key, Server, RefreshCw, CheckCircle, ArrowRight, Github } from "lucide-react"
// ANIMATION CHANGE: Import motion from framer-motion
import { motion } from "framer-motion"

export default function HomePage() {
  // ANIMATION CHANGE: Standard fade-up variant for scroll animations
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1, // Stagger effect
        duration: 0.5,
        ease: "easeOut"
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Cuticle</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="#security" className="hover:text-blue-600 transition-colors">Security</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="hidden sm:inline-flex hover:bg-slate-100">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            {/* ANIMATION CHANGE: Added subtle hover scale to main CTA */}
            <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
              <Link href="/auth/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          {/* EFFECT ADDITION: Neon Blue Lock */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none lg:left-1/3 lg:translate-x-0">
             <Lock className="h-96 w-96 text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.8)] animate-pulse" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              {/* Hero Text Content */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 text-center lg:text-left"
              >
                <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                  Now implementing Kyber-1024
                </div>
                <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-slate-900 lg:text-6xl">
                  Secure messaging for the <span className="text-blue-600 relative inline-block">
                    Quantum Era
                    {/* ANIMATION CHANGE: Subtle underline decoration */}
                    <svg className="absolute -bottom-2 left-0 w-full h-2 text-blue-200" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                  </span>
                </h1>
                <p className="mb-8 text-xl text-slate-600 leading-relaxed">
                  Future-proof your conversations with NIST-standardized Post-Quantum Cryptography. 
                  End-to-end encryption that resists attacks from both classical and quantum computers.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button asChild size="lg" className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 w-full sm:w-auto transition-transform hover:-translate-y-0.5">
                    <Link href="/auth/signup">
                      Start Messaging <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base bg-white border-slate-200 hover:bg-slate-50 w-full sm:w-auto transition-transform hover:-translate-y-0.5">
                    <Link href="https://github.com/your-repo" target="_blank">
                      <Github className="mr-2 h-4 w-4" /> Open Source
                    </Link>
                  </Button>
                </div>
                <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" /> No ads
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" /> No tracking
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" /> Open audit
                  </div>
                </div>
              </motion.div>

              {/* Abstract UI Mockup */}
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-1 w-full max-w-lg lg:max-w-none relative"
              >
                {/* ANIMATION CHANGE: Making background blobs drift slowly */}
                <div className="absolute -top-12 -right-12 h-64 w-64 bg-blue-400/10 rounded-full blur-3xl animate-[spin_10s_linear_infinite] supports-[animation-timeline]:animate-none"></div>
                <div className="absolute -bottom-12 -left-12 h-64 w-64 bg-purple-400/10 rounded-full blur-3xl animate-[bounce_8s_ease-in-out_infinite] supports-[animation-timeline]:animate-none"></div>
                
                {/* ANIMATION CHANGE: Added subtle float animation to the whole card container */}
                <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/50 animate-[pulse_4s_ease-in-out_infinite]">
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    {/* Header Mockup */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold relative">
                          JD
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                        </div>
                        <div>
                          <div className="h-2.5 w-24 bg-slate-200 rounded mb-1"></div>
                          <div className="h-2 w-16 bg-blue-100 rounded"></div>
                        </div>
                      </div>
                      {/* ANIMATION CHANGE: The shield icon pulses gently */}
                      <Shield className="h-5 w-5 text-green-500 animate-pulse" />
                    </div>
                    {/* Message Mockups */}
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <div className="rounded-2xl rounded-tr-none bg-blue-600 px-4 py-3 text-white shadow-sm max-w-[85%]">
                          <p className="text-sm">Is this channel quantum secure?</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="rounded-2xl rounded-tl-none bg-white border border-slate-200 px-4 py-3 text-slate-700 shadow-sm max-w-[85%]">
                          <p className="text-sm flex items-center gap-2">
                            <Lock className="h-3 w-3 text-blue-500" /> Encrypted via CRYSTALS-Kyber
                          </p>
                        </div>
                      </div>
                      {/* ANIMATION CHANGE: Simulated typing indicator */}
                      <div className="flex justify-start">
                         <div className="bg-slate-200/50 rounded-full px-4 py-2 w-16 flex items-center justify-center gap-1">
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                         </div>
                      </div>
                    </div>
                    {/* Input Mockup */}
                    <div className="mt-6 flex gap-2">
                      <div className="h-10 flex-1 rounded-md bg-white border border-slate-200"></div>
                      <div className="h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center">
                        <ArrowRight className="h-5 w-5 text-white/50" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-white py-24 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Built for absolute privacy</h2>
              <p className="mt-4 text-lg text-slate-600">We stripped away the bloat and focused on one thing: making sure your data can never be read by anyone else.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { 
                  icon: Lock, 
                  title: "PQC Encryption", 
                  desc: "CRYSTALS-Kyber algorithm protects against future quantum attacks.",
                  // ANIMATION CHANGE: Add specific class for the lock icon to rotate on hover
                  iconClass: "group-hover:rotate-12 transition-transform duration-300" 
                },
                { 
                  icon: Zap, 
                  title: "Real-Time Sync", 
                  desc: "Instant message delivery via Supabase Realtime channels." 
                },
                { 
                  icon: Users, 
                  title: "Zero Knowledge", 
                  desc: "We cannot read your messages. Only you hold the keys." 
                },
                { 
                  icon: Shield, 
                  title: "Row-Level Security", 
                  desc: "Database policies strictly enforce data access at the engine level." 
                }
              ].map((feature, i) => (
                // ANIMATION CHANGE: Added hover:-translate-y-2 for a tactile lift effect
                <div key={i} className="group relative rounded-2xl border border-slate-200 bg-slate-50 p-8 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-xl hover:-translate-y-2">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600 transition-colors">
                    <feature.icon className={`h-6 w-6 ${feature.iconClass || ''}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section - ANIMATION CHANGE: Sequential fade-ins using framer-motion */}
        <section id="how-it-works" className="py-24 border-t border-slate-200 bg-slate-50 relative z-0">
          <div className="container mx-auto px-4">
            <h2 className="mb-16 text-center text-3xl font-bold text-slate-900">How Cuticle protects you</h2>
            <div className="relative">
              {/* Connector Line */}
              <div className="absolute top-1/2 left-0 hidden w-full -translate-y-1/2 border-t-2 border-dashed border-slate-300 lg:block" style={{ zIndex: 0 }}></div>
              
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid gap-12 lg:grid-cols-3 relative z-10"
              >
                {[
                    { icon: Key, title: "1. Key Generation", desc: "Your device generates a public/private key pair locally using Kyber-1024. Your private key never leaves your device." },
                    { icon: Server, title: "2. Secure Handshake", desc: "We exchange public keys through our server. The server acts only as a blind courier and cannot decrypt the payload." },
                    { icon: RefreshCw, title: "3. Encrypted Tunnel", desc: "Messages are encapsulated and sent via Realtime sockets. Only the intended recipient can decapsulate them." }
                ].map((item, i) => (
                    <motion.div key={i} custom={i} variants={fadeUpVariants} className="flex flex-col items-center text-center bg-slate-50 p-4 relative group">
                      {/* ANIMATION CHANGE: Added a pulsing ring effect behind the icons on hover */}
                      <div className="mb-6 relative flex h-16 w-16 items-center justify-center rounded-full bg-white border-4 border-slate-100 shadow-xl z-10 transition-transform group-hover:scale-110">
                        <item.icon className="h-8 w-8 text-blue-600" />
                        <div className="absolute inset-0 rounded-full bg-blue-600/20 scale-0 group-hover:scale-150 transition-transform duration-500 -z-10"></div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-600">{item.desc}</p>
                    </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technical Deep Dive */}
        <section id="security" className="py-24 bg-slate-900 text-white relative overflow-hidden">
             {/* ANIMATION CHANGE: Subtle grid background pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-6">Why Post-Quantum?</h2>
                <div className="space-y-6 text-slate-300">
                  <p>
                    Quantum computers are coming. Standard encryption methods (like RSA and ECC) will be broken by Shor's algorithm in the near future. This is known as "Harvest Now, Decrypt Later."
                  </p>
                  <p>
                    Attackers are collecting encrypted data today to decrypt it once quantum computers are available. 
                    <strong className="text-white"> Cuticle prevents this.</strong>
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-6">
                    <div className="border-l-2 border-blue-500 pl-4">
                      <div className="text-2xl font-bold text-white">NIST</div>
                      <div className="text-sm">Standardized Algorithms</div>
                    </div>
                    <div className="border-l-2 border-blue-500 pl-4">
                      <div className="text-2xl font-bold text-white">AES-256</div>
                      <div className="text-sm">Symmetric Fallback</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ANIMATION CHANGE: Terminal window fades in upwards */}
              <motion.div 
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-2xl bg-slate-800 border border-slate-700 p-8 font-mono text-sm shadow-2xl relative relative group"
              >
                 {/* ANIMATION CHANGE: Subtle glow behind terminal */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative z-10">
                    <div className="flex gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="space-y-2">
                    <p className="text-slate-400"># Initializing PQC Context...</p>
                    <p className="text-blue-400">const<span className="text-white"> kem = </span>new<span className="text-yellow-300"> Kyber1024</span>();</p>
                    <p className="text-slate-400"># Generating keypair...</p>
                    <p className="text-white">{`{ pk, sk } = `}<span className="text-blue-400">await</span> kem.generateKeyPair();</p>
                    <p className="text-slate-400"># Encapsulating shared secret...</p>
                    <p className="text-white">{`{ c, ss } = `}<span className="text-blue-400">await</span> kem.encapsulate(recipient_pk);</p>
                    {/* ANIMATION CHANGE: Blinking cursor effect at the end */}
                    <p className="text-green-400 mt-4 flex items-center">
                        {`> Secure tunnel established.`}<span className="ml-1 inline-block h-4 w-2 bg-green-400 animate-pulse"></span>
                    </p>
                    </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="container mx-auto px-4 text-center"
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to go dark?</h2>
              <p className="text-xl text-slate-600 mb-8">
                Join the network of users who value privacy above all else. Free, open-source, and secure forever.
              </p>
              <Button asChild size="lg" className="h-14 px-8 text-lg bg-slate-900 hover:bg-slate-800 transition-transform hover:scale-105 shadow-xl shadow-slate-900/20">
                <Link href="/auth/signup">Create your account</Link>
              </Button>
              <p className="mt-4 text-sm text-slate-500">No credit card required • Open Source</p>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 transition-transform hover:scale-105">
              <Shield className="h-5 w-5 text-slate-400" />
              <span className="font-semibold text-slate-700">Cuticle</span>
            </div>
            <div className="text-sm text-slate-500">
              © 2024 Cuticle Inc. Built with Next.js & Supabase.
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors">Privacy</Link>
              <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors">Terms</Link>
              <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}