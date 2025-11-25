import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  UserGroupIcon,
  ChartBarIcon,
  MapPinIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const Landing = () => {
  const features = [
    {
      icon: TrophyIcon,
      title: 'Tournament Management',
      description: 'Create and manage fishing tournaments with ease. Set up multiple ponds, zones, and fishing areas.',
      color: 'from-fish-400 to-fish-500',
    },
    {
      icon: MapPinIcon,
      title: 'Area Selection',
      description: 'Visual pond layout for participants to select their preferred fishing spots with real-time availability.',
      color: 'from-ocean-400 to-ocean-500',
    },
    {
      icon: UserGroupIcon,
      title: 'Easy Registration',
      description: 'Streamlined registration process with payment tracking and automatic confirmation.',
      color: 'from-forest-400 to-forest-500',
    },
    {
      icon: ChartBarIcon,
      title: 'Live Leaderboard',
      description: 'Real-time leaderboard with catch submissions and approval system for fair competition.',
      color: 'from-purple-400 to-purple-500',
    },
  ];

  const benefits = [
    'Multiple pond and zone configuration',
    'Visual area selection interface',
    'Payment receipt upload & verification',
    'Catch photo submission system',
    'Organizer approval workflow',
    'Unique shareable tournament links',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-ocean-900 to-slate-900 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-ocean-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-forest-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-fish-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-3">
          <Link 
            to="/" 
            className="flex items-center gap-1.5 md:gap-3 flex-shrink-0 touch-manipulation"
          >
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center shadow-lg shadow-ocean-500/30 flex-shrink-0">
              <span className="text-lg md:text-2xl">🎣</span>
            </div>
            <span className="font-display text-base md:text-2xl font-bold text-white whitespace-nowrap">Pesca Pro</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
            <Link 
              to="/login" 
              className="text-ocean-200 hover:text-white active:text-white transition-colors font-medium px-2 md:px-3 lg:px-4 py-2 md:py-2.5 min-h-[44px] flex items-center justify-center touch-manipulation text-xs md:text-sm lg:text-base whitespace-nowrap"
            >
              Participant Login
            </Link>
            <Link 
              to="/organizer/login" 
              className="btn-primary text-xs md:text-sm lg:text-base px-3 md:px-4 lg:px-6 py-2 md:py-2.5 lg:py-3 whitespace-nowrap"
            >
              Organizer Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ocean-500/20 border border-ocean-400/30 text-ocean-300 text-sm font-medium mb-8">
              <span className="animate-pulse">🔥</span>
              Professional Tournament Management
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              The Ultimate{' '}
              <span className="bg-gradient-to-r from-ocean-400 via-fish-400 to-forest-400 bg-clip-text text-transparent">
                Fishing Tournament
              </span>{' '}
              Platform
            </h1>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12">
              Organize professional fishing tournaments with pond layouts, area selection, 
              registration management, and live leaderboards - all in one platform.
            </p>
            
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 md:gap-4 w-full md:w-auto">
              <Link 
                to="/register" 
                className="btn-primary flex items-center justify-center gap-2 text-sm md:text-base lg:text-lg px-5 md:px-6 lg:px-8 py-3 md:py-4 min-h-[48px] md:min-h-[56px] w-full md:w-auto"
              >
                Join as Participant
                <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              </Link>
              <Link 
                to="/organizer/register" 
                className="btn-secondary text-sm md:text-base lg:text-lg px-5 md:px-6 lg:px-8 py-3 md:py-4 min-h-[48px] md:min-h-[56px] w-full md:w-auto flex items-center justify-center"
              >
                Create Tournament
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
          >
            {[
              { value: '100+', label: 'Tournaments' },
              { value: '5K+', label: 'Participants' },
              { value: '10K+', label: 'Catches Recorded' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-24 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Comprehensive features for both organizers and participants
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-colors group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                Built for{' '}
                <span className="text-gradient">Professional</span>{' '}
                Tournaments
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                From small local competitions to large-scale fishing events, 
                Pesca Pro scales with your needs.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircleIcon className="w-6 h-6 text-forest-400 flex-shrink-0" />
                    <span className="text-slate-300">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-ocean-500/20 to-forest-500/20 border border-white/10 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">🏆</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to Start?</h3>
                  <p className="text-slate-400 mb-6">Create your first tournament in minutes</p>
                  <Link 
                    to="/organizer/register" 
                    className="btn-success inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] w-full sm:w-auto"
                  >
                    Get Started Free
                    <ArrowRightIcon className="w-4 h-4 flex-shrink-0" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-r from-ocean-600/30 to-forest-600/30 border border-white/10 backdrop-blur"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Host Your Tournament?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Join thousands of organizers who trust Pesca Pro for their fishing events.
            </p>
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 md:gap-4 w-full md:w-auto">
              <Link 
                to="/organizer/register" 
                className="btn-primary text-sm md:text-base lg:text-lg px-5 md:px-6 lg:px-8 py-3 md:py-4 min-h-[48px] md:min-h-[56px] w-full md:w-auto flex items-center justify-center"
              >
                Start Free Trial
              </Link>
              <Link 
                to="/login" 
                className="text-ocean-300 hover:text-white transition-colors font-medium px-3 md:px-4 py-2.5 md:py-3 min-h-[44px] flex items-center justify-center touch-manipulation text-center text-xs md:text-sm"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎣</span>
            <span className="text-slate-400">© 2024 Pesca Pro. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

