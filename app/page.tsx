"use client"

export const dynamic = "force-dynamic"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Lock, Zap, Users, Key, Server, RefreshCw, CheckCircle, ArrowRight, Github, User, Network, FileKey, Database } from "lucide-react"
import { motion, Easing } from "framer-motion"

// Numeric cubic-bezier equivalents for easing
const easeOutExpo: Easing = [0.22, 1, 0.36, 1]
const easeInOut: Easing = [0.42, 0, 0.58, 1]

export default function HomePage() {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: easeOutExpo,
      }
    })
  }

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 1.2, ease: easeInOut }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Cuticle</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#architecture" className="hover:text-blue-600 transition-colors">Architecture</Link>
            <Link href="#security" className="hover:text-blue-600 transition-colors">Deep Dive</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="hidden sm:inline-flex hover:bg-slate-100">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95">
              <Link href="/auth/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-28 lg:pb-32">
          {/* Neon Blue Lock Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none lg:left-1/3 lg:translate-x-0">
            <Lock className="h-[500px] w-[500px] text-blue-500 drop-shadow-[0_0_50px_rgba(59,130,246,0.6)] animate-pulse duration-[4s]" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Hero Text Content */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: easeOutExpo }}
                className="flex-1 text-center lg:text-left"
              >
                <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                  Now implementing Kyber-1024
                </div>
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 lg:text-6xl">
                  Secure messaging for the <span className="text-blue-600 relative whitespace-nowrap">
                    Quantum Era
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
                    <Link href="https://github.com/Naveen17000/cuticle.git" target="_blank">
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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: easeOutExpo }}
                className="flex-1 w-full max-w-lg lg:max-w-none relative"
              >
                <div className="absolute -top-12 -right-12 h-64 w-64 bg-blue-400/10 rounded-full blur-3xl animate-[spin_12s_linear_infinite] supports-[animation-timeline]:animate-none"></div>
                <div className="absolute -bottom-12 -left-12 h-64 w-64 bg-purple-400/10 rounded-full blur-3xl animate-[bounce_10s_ease-in-out_infinite] supports-[animation-timeline]:animate-none"></div>
                
                <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/50 animate-[pulse_5s_ease-in-out_infinite]">
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
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
                      <Shield className="h-5 w-5 text-green-500 animate-pulse" />
                    </div>
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
                      <div className="flex justify-start">
                         <div className="bg-slate-200/50 rounded-full px-4 py-2 w-16 flex items-center justify-center gap-1 shadow-sm">
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                         </div>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <div className="h-10 flex-1 rounded-md bg-white border border-slate-200 shadow-sm"></div>
                      <div className="h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center shadow-sm">
                        <ArrowRight className="h-5 w-5 text-white/80" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-white py-20 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Built for absolute privacy</h2>
              <p className="mt-4 text-lg text-slate-600">We stripped away the bloat and focused on zero-trust architecture.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { 
                  icon: Lock, 
                  title: "PQC Encryption", 
                  desc: "CRYSTALS-Kyber algorithm protects against future quantum attacks.",
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
                <div key={i} className="group relative rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-xl hover:-translate-y-1">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600 transition-colors">
                    <feature.icon className={`h-5 w-5 ${feature.iconClass || ''}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-snug">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ARCHITECTURE DIAGRAM SECTION */}
        <section
          id="architecture"
          className="py-20 border-t border-slate-200 bg-slate-50 relative overflow-hidden"
        >
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] opacity-5 pointer-events-none"></div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                The Kyber Encapsulation Process
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                How Alice and Bob establish a quantum-safe shared secret over an untrusted network using CRYSTALS-Kyber KEM.
              </p>
            </div>

 {/* Diagram Grid */}
            <div className="relative bg-white rounded-3xl border border-slate-200 p-8 lg:p-12 shadow-xl">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid lg:grid-cols-3 gap-8 items-start relative"
              >
                {/* BOB (Receiver) - Step 1 */}
                <motion.div
                  variants={fadeUpVariants}
                  custom={1}
                  className="flex flex-col items-center text-center relative z-20"
                >
                  <div className="h-24 w-24 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm relative">
                    <User className="h-10 w-10 text-blue-600" />
                    <div className="absolute -top-2 -right-2 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white">
                      Bob
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Receiver</h3>
                  <div className="mt-4 bg-slate-100 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-600 text-left w-full max-w-[200px]">
                    <p className="font-semibold text-blue-700 mb-1">1. KeyGen()</p>
                    <p>sk_B (Private)</p>
                    <p>pk_B (Public)</p>
                  </div>
                  <div className="mt-4 h-16"></div>
                </motion.div>

                {/* NETWORK / CHANNEL */}
                <motion.div
                  variants={fadeUpVariants}
                  custom={2}
                  className="flex flex-col items-center justify-start relative z-10 min-h-[500px]"
                >
                  {/* Top Data Flow - Bob to Alice */}
                  <div className="absolute top-24 left-0 w-full h-12 flex items-center">
                    <svg
                      className="w-full h-full absolute hidden lg:block"
                      viewBox="0 0 400 40"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <motion.path
                        d="M 0 20 L 400 20"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="8 8"
                        variants={lineVariants}
                      />
                      <motion.path
                        d="M 390 20 L 380 10 M 390 20 L 380 30"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                      />
                    </svg>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm mx-auto relative z-20 flex items-center gap-1"
                    >
                      <FileKey className="h-3 w-3" /> Public Key (pk_B)
                    </motion.div>
                  </div>

                  {/* Central Network Node */}
                  <div className="h-32 w-32 bg-slate-100 border-2 border-slate-300 border-dashed rounded-full flex flex-col items-center justify-center p-4 text-center z-20 relative mt-48">
                    <Network className="h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-500">Untrusted Server</p>
                    <p className="text-[10px] text-slate-400">Can see pk_B & Ciphertext</p>
                  </div>

                  {/* Bottom Data Flow - Alice to Bob */}
                  <div className="absolute bottom-24 left-0 w-full h-12 flex items-center">
                    <svg
                      className="w-full h-full absolute hidden lg:block"
                      viewBox="0 0 400 40"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <motion.path
                        d="M 400 20 L 0 20"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="8 8"
                        variants={lineVariants}
                        transition={{ delay: 2 }}
                      />
                      <motion.path
                        d="M 10 20 L 20 10 M 10 20 L 20 30"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.5 }}
                      />
                    </svg>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.8 }}
                      className="bg-white border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm mx-auto relative z-20 flex items-center gap-1"
                    >
                      <Database className="h-3 w-3" /> Ciphertext (c)
                    </motion.div>
                  </div>
                </motion.div>

                {/* ALICE (Sender) - Step 2 */}
                <motion.div
                  variants={fadeUpVariants}
                  custom={3}
                  className="flex flex-col items-center text-center relative z-20"
                >
                  <div className="h-24 w-24 bg-purple-50 border-2 border-purple-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm relative">
                    <User className="h-10 w-10 text-purple-600" />
                    <div className="absolute -top-2 -right-2 h-8 w-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white">
                      Alice
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Sender</h3>
                  <div className="mt-4 bg-slate-100 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-600 text-left w-full max-w-[200px]">
                    <p className="font-semibold text-purple-700 mb-1">2. Encapsulate(pk_B)</p>
                    <p>→ Shared Secret (ss)</p>
                    <p>→ Ciphertext (c)</p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 4, type: "spring" }}
                    className="mt-4 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-md"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Alice has (ss)
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Step 3 - Bob Decapsulates - Centered Below */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUpVariants}
                custom={5}
                className="flex flex-col items-center text-center relative z-20 mt-12 pt-12 border-t border-slate-200"
              >
                <div className="h-24 w-24 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm relative">
                  <User className="h-10 w-10 text-blue-600" />
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white">
                    Bob
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Receiver</h3>
                <div className="mt-4 bg-slate-100 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-600 text-left w-full max-w-[200px]">
                  <p className="font-semibold text-blue-700 mb-1">3. Decapsulate(c, sk_B)</p>
                  <p>→ Shared Secret (ss)</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 4.2, type: "spring" }}
                  className="mt-4 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-md"
                >
                  <CheckCircle className="h-4 w-4" />
                  Bob has (ss)
                </motion.div>
              </motion.div>

              {/* Final Text */}
              <div className="text-center mt-16 text-sm text-slate-500">
                Once both parties hold the same Shared Secret (ss), they use it to encrypt actual messages via AES-256.
              </div>
            </div>
          </div>
        </section>


        {/* Technical Deep Dive */}
        <section id="security" className="py-20 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-6">Why Kyber-1024?</h2>
                <div className="space-y-6 text-slate-300">
                  <p>
                    Standard encryption methods (RSA, ECC) rely on math problems that quantum computers can solve easily using Shor's algorithm.
                  </p>
                  <p>
                    CRYSTALS-Kyber is a <strong>lattice-based</strong> cryptographic algorithm selected by NIST as the primary standard for Post-Quantum general encryption. Its mathematical foundation is believed to be resistant to both classical and quantum computer attacks.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-6">
                    <div className="border-l-2 border-blue-500 pl-4">
                      <div className="text-xl font-bold text-white">NIST FIPS 203</div>
                      <div className="text-sm opacity-80">Draft Standard</div>
                    </div>
                    <div className="border-l-2 border-blue-500 pl-4">
                      <div className="text-xl font-bold text-white">AES-256-GCM</div>
                      <div className="text-sm opacity-80">Symmetric Payload</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Terminal window */}
              <motion.div 
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-2xl bg-slate-950/50 border border-slate-800 p-6 lg:p-8 font-mono text-[13px] lg:text-sm shadow-2xl relative relative group backdrop-blur-md"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative z-10">
                    <div className="flex gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="space-y-2 leading-relaxed">
                    <p className="text-slate-500"># Initializing PQC Context...</p>
                    <p className="text-blue-400">const<span className="text-slate-200"> kem = </span>new<span className="text-yellow-300"> Kyber1024</span>();</p>
                    <p className="text-slate-500 mt-4"># Bob generates keypair...</p>
                    <p className="text-slate-200">{`{ pk_B, sk_B } = `}<span className="text-blue-400">await</span> kem.generateKeyPair();</p>
                    <p className="text-slate-500 mt-4"># Alice encapsulates shared secret using Bob's pk...</p>
                    <p className="text-slate-200">{`{ cipher_c, ss_A } = `}<span className="text-blue-400">await</span> kem.encapsulate(pk_B);</p>
                    <p className="text-slate-500 mt-4"># Bob decapsulates ciphertext using his sk...</p>
                    <p className="text-slate-200">{`const ss_B = `}<span className="text-blue-400">await</span> kem.decapsulate(cipher_c, sk_B);</p>
                    
                    <p className="text-green-400 mt-6 flex items-center font-bold">
                        {`> Quantum-safe tunnel established.`}<span className="ml-2 inline-block h-5 w-2.5 bg-green-400 animate-pulse shadow-[0_0_10px_currentColor]"></span>
                    </p>
                    </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="container mx-auto px-4 text-center"
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-6 sm:text-4xl">Ready to go dark?</h2>
              <p className="text-xl text-slate-600 mb-8">
                Join the network of users who value privacy above all else. Free, open-source, and secure forever.
              </p>
              <Button asChild size="lg" className="h-12 px-8 text-lg bg-slate-900 hover:bg-slate-800 transition-transform hover:scale-105 shadow-xl shadow-slate-900/20">
                <Link href="/auth/signup">Create your account</Link>
              </Button>
              <p className="mt-4 text-sm text-slate-500">No credit card required • Open Source</p>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 transition-transform hover:scale-105">
              <Shield className="h-5 w-5 text-slate-400" />
              <span className="font-semibold text-slate-700">Cuticle</span>
            </div>
            <div className="text-sm text-slate-500">
              © 2024 Cuticle Inc. Built with Next.js & Supabase.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors">Privacy</Link>
              <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors">Terms</Link>
              <Link href="https://github.com/Naveen17000/cuticle.git" className="text-slate-400 hover:text-slate-900 transition-colors">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}