import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Users, 
  Sparkles, 
  Layout, 
  Camera, 
  FileText,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { QUESTIONS, PROFILE_DEFINITIONS } from './data/survey';
import { SurveyState, ProfileType } from './types';
import { generateFinalReports, generateFinalImages } from './services/gemini';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  const [state, setState] = useState<SurveyState>({
    userName: '',
    inhabitants: 1,
    ages: '',
    pets: '',
    answers: {},
    scores: {
      'Social': 0,
      'Sensorial': 0,
      'Práctico Funcional': 0,
      'Visionario Sofisticado': 0
    },
    currentStep: -1, // -1: Welcome, 0: Basic Info, 1+: Questions
    isCompleted: false
  });

  const [loading, setLoading] = useState(false);
  const [finalImages, setFinalImages] = useState<string[]>([]);
  const [reports, setReports] = useState<{ clientReport: string; architectReport: string } | null>(null);
  const [dominantProfile, setDominantProfile] = useState<ProfileType | null>(null);

  const [isAdvancing, setIsAdvancing] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  const handleStart = () => {
    setDirection(1);
    setState(prev => ({ ...prev, currentStep: 0 }));
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, currentStep: 1 }));
  };

  const handleOptionSelect = async (questionId: string, optionId: string) => {
    if (isAdvancing) return;
    
    const question = QUESTIONS.find(q => q.id === questionId);
    const option = question?.options.find(o => o.id === optionId);
    if (!option) return;

    // Update scores
    const newScores = { ...state.scores };
    
    // If there was a previous answer, subtract its scores
    const previousOptionId = state.answers[questionId];
    if (previousOptionId) {
      const previousOption = question?.options.find(o => o.id === previousOptionId);
      previousOption?.profiles.forEach(p => {
        newScores[p] = Math.max(0, (newScores[p] || 0) - 1);
      });
    }

    // Add new scores
    option.profiles.forEach(p => {
      newScores[p] = (newScores[p] || 0) + 1;
    });

    const newState = {
      ...state,
      answers: { ...state.answers, [questionId]: optionId },
      scores: newScores
    };

    setState(newState);

    setIsAdvancing(true);
    setDirection(1);
    // Auto-advance after a short delay
    setTimeout(() => {
      nextStep(newState);
      setIsAdvancing(false);
    }, 600);
  };

  const nextStep = (currentState: SurveyState = state) => {
    setDirection(1);
    if (currentState.currentStep < QUESTIONS.length) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    } else {
      finishSurvey(currentState);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    if (state.currentStep > 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    } else if (state.currentStep === 1) {
      setState(prev => ({ ...prev, currentStep: 0 }));
    }
  };

  const skipStep = () => {
    setDirection(1);
    nextStep(state);
  };

  const finishSurvey = async (finalState: SurveyState) => {
    setLoading(true);
    console.log("Finishing survey with state:", finalState);
    
    try {
      // Calculate dominant profile
      const sortedProfiles = (Object.entries(finalState.scores) as [ProfileType, number][])
        .sort((a, b) => b[1] - a[1]);
      const winner = sortedProfiles[0][0];
      console.log("Dominant profile winner:", winner);
      setDominantProfile(winner);

      // Generate reports and images
      console.log("Generating reports and images...");
      const [generatedReports, generatedImages] = await Promise.all([
        generateFinalReports(finalState, winner),
        generateFinalImages(finalState, winner)
      ]);
      
      console.log("Generated reports:", generatedReports);
      console.log("Generated images count:", generatedImages.length);

      setReports(generatedReports);
      setFinalImages(generatedImages);

      // Save to Firebase
      try {
        await addDoc(collection(db, 'surveyResults'), {
          userName: finalState.userName,
          inhabitants: finalState.inhabitants,
          ages: finalState.ages,
          pets: finalState.pets,
          answers: finalState.answers,
          scores: finalState.scores,
          dominantProfile: winner,
          clientReport: generatedReports.clientReport,
          architectReport: generatedReports.architectReport,
          createdAt: serverTimestamp()
        });
        console.log("Saved to Firebase successfully");
      } catch (fbError) {
        console.error("Error saving to Firebase:", fbError);
      }

      setState(prev => ({ ...prev, isCompleted: true }));
    } catch (error) {
      console.error("Error in finishSurvey:", error);
    } finally {
      setLoading(false);
    }
  };

  // Renderers
  const renderWelcome = () => (
    <motion.div 
      key="welcome"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="mb-12"
      >
        <span className="text-xs uppercase tracking-[1em] text-amber-500 font-bold mb-6 block">Bogotá, Colombia</span>
        <img 
          src="/logo-casa-pizano-2 vf.png" 
          alt="Casa Pizano" 
          className="h-32 md:h-48 w-auto mx-auto"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </motion.div>
      
      <p className="text-xl md:text-2xl text-zinc-400 font-light mb-16 max-w-2xl mx-auto leading-relaxed italic">
        "Descubre el espacio que resuena con tu esencia a través de nuestra experiencia de diseño algorítmico."
      </p>

      <button 
        onClick={handleStart}
        className="group relative px-16 py-6 bg-white text-black text-xs font-bold tracking-[0.3em] uppercase hover:bg-amber-500 transition-all duration-700 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-4">
          Comenzar Viaje
          <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
        </span>
      </button>
    </motion.div>
  );

  const renderBasicInfo = () => (
    <motion.div 
      key="basic-info"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto py-32 px-6"
    >
      <div className="text-center mb-20 space-y-4">
        <span className="text-xs uppercase tracking-[0.5em] text-amber-500 font-bold">Fase 01</span>
        <h2 className="text-5xl md:text-6xl font-light text-white tracking-tighter uppercase">Contexto del Proyecto</h2>
        <div className="h-px bg-zinc-800 mx-auto mt-8 w-12" />
      </div>

      <form onSubmit={handleBasicInfoSubmit} className="space-y-16">
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Nombre del Propietario</label>
          <input 
            required
            type="text" 
            value={state.userName}
            onChange={e => setState(prev => ({ ...prev, userName: e.target.value }))}
            className="w-full bg-transparent border-b border-zinc-800 py-6 text-3xl md:text-4xl font-light text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-900"
            placeholder="Escribe tu nombre..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Inquilinos</label>
            <input 
              required
              type="number" 
              min="1"
              value={state.inhabitants}
              onChange={e => setState(prev => ({ ...prev, inhabitants: parseInt(e.target.value) }))}
              className="w-full bg-transparent border-b border-zinc-800 py-6 text-3xl md:text-4xl font-light text-white focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Edades</label>
            <input 
              required
              type="text" 
              value={state.ages}
              onChange={e => setState(prev => ({ ...prev, ages: e.target.value }))}
              className="w-full bg-transparent border-b border-zinc-800 py-6 text-3xl md:text-4xl font-light text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-900"
              placeholder="Ej: 35, 32, 5"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Compañeros Animales</label>
          <input 
            type="text" 
            value={state.pets}
            onChange={e => setState(prev => ({ ...prev, pets: e.target.value }))}
            className="w-full bg-transparent border-b border-zinc-800 py-6 text-3xl md:text-4xl font-light text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-900"
            placeholder="Ej: 2 perros labradores"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12">
          <button 
            type="button"
            onClick={() => setState(prev => ({ ...prev, currentStep: -1 }))}
            disabled={loading}
            className="w-full md:w-auto px-12 py-6 border border-zinc-900 text-zinc-600 uppercase tracking-widest text-[10px] font-bold hover:text-white hover:border-zinc-700 transition-all disabled:opacity-20"
          >
            Regresar
          </button>
          <button 
            type="submit"
            className="w-full md:flex-1 py-6 bg-zinc-900 text-white uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-white hover:text-black transition-all duration-700 border border-zinc-800"
          >
            Iniciar Descubrimiento
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderQuestion = () => {
    const questionIndex = state.currentStep - 1;
    const question = QUESTIONS[questionIndex];
    const selectedOptionId = state.answers[question.id];
    const progress = (state.currentStep / QUESTIONS.length) * 100;

    const containerVariants = {
      enter: (direction: number) => ({
        x: direction > 0 ? 20 : -20,
        opacity: 0,
        filter: 'blur(10px)'
      }),
      center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1] as any
        }
      },
      exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 20 : -20,
        opacity: 0,
        filter: 'blur(10px)',
        transition: {
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1] as any
        }
      })
    };

    const itemVariants = {
      enter: { opacity: 0, y: 10 },
      center: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 }
    };

    return (
      <motion.div 
        key={`step-${state.currentStep}`}
        custom={direction}
        variants={containerVariants}
        initial="enter"
        animate="center"
        exit="exit"
        className="max-w-4xl mx-auto py-20 px-6 min-h-[80vh] flex flex-col"
      >
        {/* Progress Bar */}
        <div className="w-full h-0.5 bg-zinc-900 mb-24 relative overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
            className="absolute top-0 left-0 h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
          />
        </div>

        <div className="flex-1 space-y-16">
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <span className="text-[10px] uppercase tracking-[0.5em] text-amber-500 font-bold">
              Espacio {state.currentStep} de {QUESTIONS.length}
            </span>
            <h2 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">{question.title}</h2>
            <h3 className="text-4xl md:text-6xl font-light text-white leading-tight tracking-tighter uppercase max-w-3xl mx-auto">
              {question.question}
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
            {question.options.map(option => (
              <motion.button
                key={option.id}
                variants={itemVariants}
                onClick={() => handleOptionSelect(question.id, option.id)}
                disabled={loading || isAdvancing}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-8 border transition-all duration-700 group relative overflow-hidden ${
                  selectedOptionId === option.id 
                    ? 'bg-white border-white text-black' 
                    : 'bg-transparent border-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-white hover:bg-zinc-950'
                }`}
              >
                <div className="flex items-center gap-8 relative z-10">
                  <span className={`text-[10px] font-mono ${selectedOptionId === option.id ? 'text-black' : 'text-zinc-700'}`}>
                    0{option.id}
                  </span>
                  <p className="text-xl font-light tracking-tight">{option.text}</p>
                </div>
                {selectedOptionId === option.id && (
                  <motion.div 
                    layoutId="active-bg"
                    className="absolute inset-0 bg-white"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <motion.div variants={itemVariants} className="flex items-center justify-between pt-16 max-w-2xl mx-auto">
            <button
              onClick={prevStep}
              disabled={loading || isAdvancing}
              className="flex items-center gap-4 text-zinc-600 uppercase tracking-[0.3em] text-[10px] font-bold hover:text-white transition-all group disabled:opacity-10"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Anterior
            </button>
            
            <button
              onClick={skipStep}
              disabled={loading || isAdvancing}
              className="flex items-center gap-4 text-zinc-600 uppercase tracking-[0.3em] text-[10px] font-bold hover:text-white transition-all group disabled:opacity-10"
            >
              Omitir
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderResults = () => {
    console.log("Rendering results. dominantProfile:", dominantProfile, "reports:", reports);
    if (!dominantProfile || !reports) {
      console.log("renderResults returning null because:", { dominantProfile, reports });
      return (
        <div key="results-loading" className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="animate-spin text-amber-500 mx-auto" size={48} />
            <p className="text-zinc-500 uppercase tracking-widest text-xs">Preparando tu informe final...</p>
          </div>
        </div>
      );
    }
    const profileDef = PROFILE_DEFINITIONS[dominantProfile];

    return (
      <motion.div 
        key="results"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-black text-zinc-300"
      >
        {/* Landing Page Hero */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {finalImages && finalImages.length > 0 ? (
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              <img 
                src={finalImages[0]} 
                alt="Hero" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-black" />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-zinc-900/20" />
          )}
          
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto space-y-8">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.8em] text-amber-500 font-bold block"
            >
              Tu Hábitat Ideal
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-7xl md:text-9xl font-light text-white tracking-tighter uppercase leading-none"
            >
              {profileDef.title}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-3xl text-zinc-400 font-light italic max-w-3xl mx-auto leading-relaxed"
            >
              "{profileDef.description}"
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          >
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Explorar Informe</span>
            <div className="w-px h-12 bg-linear-to-b from-amber-500 to-transparent" />
          </motion.div>
        </section>

        {/* Narrative Section */}
        <section className="py-32 px-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-16 items-start">
            <div className="sticky top-32 space-y-4">
              <span className="text-xs uppercase tracking-widest text-amber-500 font-bold">La Esencia</span>
              <h3 className="text-3xl font-light text-white leading-tight">Tu Manifiesto de Diseño</h3>
              <div className="h-px bg-zinc-800 w-12" />
            </div>
            <div className="prose prose-invert prose-amber prose-lg max-w-none font-light leading-relaxed text-zinc-400">
              {reports.clientReport ? (
                <ReactMarkdown>{reports.clientReport}</ReactMarkdown>
              ) : (
                <p>Generando narrativa personalizada...</p>
              )}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-32 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 flex justify-between items-end">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-widest text-amber-500 font-bold">Visualización</span>
                <h3 className="text-5xl font-light text-white tracking-tighter uppercase">Atmósferas Proyectadas</h3>
              </div>
              <p className="text-zinc-500 text-sm max-w-xs text-right hidden md:block italic">
                Renders fotorrealistas basados en tus preferencias de materiales, luz y espacialidad.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 aspect-video overflow-hidden border border-zinc-800 group">
                <img 
                  src={(finalImages && finalImages[1]) || (finalImages && finalImages[0]) || "https://picsum.photos/seed/arch1/1200/800"} 
                  alt="Gallery 1" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="md:col-span-4 aspect-4/5 overflow-hidden border border-zinc-800 group">
                <img 
                  src={(finalImages && finalImages[2]) || (finalImages && finalImages[0]) || "https://picsum.photos/seed/arch2/800/1000"} 
                  alt="Gallery 2" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="md:col-span-4 aspect-square overflow-hidden border border-zinc-800 group">
                <img 
                  src={(finalImages && finalImages[0]) || "https://picsum.photos/seed/arch3/800/800"} 
                  alt="Gallery 3" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="md:col-span-8 aspect-video overflow-hidden border border-zinc-800 group">
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center p-12 text-center">
                  <div className="space-y-6">
                    <Sparkles className="mx-auto text-amber-500 opacity-50" size={40} />
                    <p className="text-xl font-light text-zinc-400 italic">
                      "Cada detalle ha sido orquestado para resonar con tu visión única del hábitat."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Section */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-white text-black p-12 md:p-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FileText size={120} />
            </div>
            <div className="relative z-10 space-y-12">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">Documentación</span>
                <h3 className="text-4xl font-light tracking-tighter uppercase">Informe Técnico Arquitectónico</h3>
                <div className="w-24 h-1 bg-black" />
              </div>
              <div className="prose prose-zinc max-w-none text-sm columns-1 md:columns-2 gap-12">
                {reports.architectReport ? (
                  <ReactMarkdown>{reports.architectReport}</ReactMarkdown>
                ) : (
                  <p>Preparando especificaciones técnicas...</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer / CTA */}
        <footer className="py-32 px-6 text-center border-t border-zinc-900">
          <div className="max-w-2xl mx-auto space-y-12">
            <h4 className="text-3xl font-light text-white uppercase tracking-tighter">¿Listo para materializar esta visión?</h4>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-12 py-5 bg-white text-black uppercase tracking-widest font-bold hover:bg-amber-500 transition-colors"
              >
                Nueva Consultoría
              </button>
              <button 
                className="px-12 py-5 border border-zinc-800 text-white uppercase tracking-widest hover:border-white transition-all"
              >
                Contactar Estudio
              </button>
            </div>
            <img 
              src="/logo-casa-pizano-2 vf.png" 
              alt="Casa Pizano" 
              className="h-12 w-auto mx-auto mb-12"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600">
              Casa Pizano © 2026 — Bogotá, Colombia
            </p>
          </div>
        </footer>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-amber-500 selection:text-black">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-zinc-900/20 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 p-8 flex justify-between items-center">
        <img 
          src="/logo-casa-pizano-2 vf.png" 
          alt="Casa Pizano" 
          className="h-10 w-auto"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        {state.currentStep > 0 && !state.isCompleted && (
          <div className="hidden md:flex items-center gap-8">
            <div className="h-px w-32 bg-zinc-800" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              {state.userName} — Bogotá, Colombia
            </span>
          </div>
        )}
      </header>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {state.currentStep === -1 && renderWelcome()}
          {state.currentStep === 0 && renderBasicInfo()}
          {state.currentStep > 0 && !state.isCompleted && renderQuestion()}
          {state.isCompleted && renderResults()}
        </AnimatePresence>
      </main>

      {loading && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-amber-500 mb-6" size={64} />
          <h2 className="text-2xl font-light text-white uppercase tracking-[0.3em]">Orquestando tu Hábitat</h2>
          <p className="text-zinc-500 mt-4 font-mono text-xs text-center px-6">
            Estamos generando tu informe personalizado y visualizaciones fotorrealistas...
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
