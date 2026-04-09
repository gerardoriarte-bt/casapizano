import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Layout, 
  Loader2,
  ArrowRight,
  Minus,
  Plus
} from 'lucide-react';
import { QUESTIONS, PROFILE_DEFINITIONS } from './data/survey';
import {
  SurveyState,
  ProfileType,
  APARTMENT_SIZE_LABELS,
  APARTMENT_SIZE_BAND_ORDER,
} from './types';
import { generateClientReport } from './services/openai';

/** Colores para gráficos de perfiles (donut + barras). */
const PROFILE_CHART: Record<
  ProfileType,
  { gradient: string; glow: string; hex: string; label: string }
> = {
  Social: {
    gradient: 'bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500',
    glow: 'shadow-[0_0_24px_rgba(245,158,11,0.5)]',
    hex: '#f59e0b',
    label: 'Social',
  },
  Sensorial: {
    gradient: 'bg-gradient-to-r from-teal-300 via-cyan-400 to-emerald-600',
    glow: 'shadow-[0_0_24px_rgba(45,212,191,0.45)]',
    hex: '#2dd4bf',
    label: 'Sensorial',
  },
  'Práctico Funcional': {
    gradient: 'bg-gradient-to-r from-zinc-400 via-slate-400 to-zinc-600',
    glow: 'shadow-[0_0_20px_rgba(161,161,170,0.4)]',
    hex: '#a1a1aa',
    label: 'Práctico',
  },
  'Visionario Sofisticado': {
    gradient: 'bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-600',
    glow: 'shadow-[0_0_24px_rgba(139,92,246,0.45)]',
    hex: '#a78bfa',
    label: 'Visionario',
  },
};
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  const [state, setState] = useState<SurveyState>({
    userName: '',
    alreadyPurchased: null,
    apartmentSizeBand: null,
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
  const [reports, setReports] = useState<{ clientReport: string } | null>(null);
  const [dominantProfile, setDominantProfile] = useState<ProfileType | null>(null);

  const [isAdvancing, setIsAdvancing] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [basicFormError, setBasicFormError] = useState<string | null>(null);

  const handleStart = () => {
    setDirection(1);
    setState(prev => ({ ...prev, currentStep: 0 }));
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.alreadyPurchased === null) {
      setBasicFormError('Indica si ya compraste el apartamento.');
      return;
    }
    if (state.alreadyPurchased === true && state.apartmentSizeBand === null) {
      setBasicFormError('Selecciona la superficie aproximada de tu apartamento.');
      return;
    }
    setBasicFormError(null);
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

      console.log("Generating client manifest...");
      const generated = await generateClientReport(finalState, winner);
      console.log("Generated client report");

      setReports(generated);

      const answersHuman = QUESTIONS.flatMap((q) => {
        const optId = finalState.answers[q.id];
        const opt = q.options.find((o) => o.id === optId);
        if (!opt) return [];
        return [
          {
            id: q.id,
            title: q.title,
            question: q.question,
            optionId: opt.id,
            optionText: opt.text,
          },
        ];
      });

      const sheetPayload = {
        submittedAt: new Date().toISOString(),
        userName: finalState.userName,
        alreadyPurchased: finalState.alreadyPurchased === true,
        apartmentSizeBand: finalState.alreadyPurchased
          ? finalState.apartmentSizeBand
          : null,
        apartmentSizeLabel:
          finalState.alreadyPurchased && finalState.apartmentSizeBand
            ? APARTMENT_SIZE_LABELS[finalState.apartmentSizeBand]
            : null,
        inhabitants: finalState.inhabitants,
        ages: finalState.ages,
        pets: finalState.pets,
        dominantProfile: winner,
        scores: finalState.scores,
        answers: finalState.answers,
        answersHuman,
        clientReport: generated.clientReport,
      };

      // Save to Firebase
      try {
        await addDoc(collection(db, 'surveyResults'), {
          userName: finalState.userName,
          alreadyPurchased: finalState.alreadyPurchased === true,
          apartmentSizeBand: finalState.alreadyPurchased
            ? finalState.apartmentSizeBand
            : null,
          inhabitants: finalState.inhabitants,
          ages: finalState.ages,
          pets: finalState.pets,
          answers: finalState.answers,
          scores: finalState.scores,
          dominantProfile: winner,
          clientReport: generated.clientReport,
          createdAt: serverTimestamp()
        });
        console.log("Saved to Firebase successfully");
      } catch (fbError) {
        console.error("Error saving to Firebase:", fbError);
      }

      try {
        const exportRes = await fetch('/api/survey-export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sheetPayload),
        });
        const exportJson = await exportRes.json().catch(() => ({}));
        if (!exportRes.ok) {
          console.warn('survey-export:', exportRes.status, exportJson);
        }
      } catch (sheetErr) {
        console.warn('survey-export request failed:', sheetErr);
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

        <div className="space-y-6 rounded-sm border border-zinc-800/80 bg-zinc-950/40 p-8 md:p-10">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500/90 font-bold">
              Estado de la compra
            </span>
            <h3 className="text-2xl md:text-3xl font-light text-white tracking-tight">
              ¿Ya compraste el apartamento?
            </h3>
            <p className="text-sm md:text-base text-zinc-500 font-light leading-relaxed max-w-2xl">
              Si ya es tuyo, indica también el tamaño aproximado en metros cuadrados para afinar la propuesta.
            </p>
          </div>
          <div
            className="flex flex-col sm:flex-row gap-3"
            role="group"
            aria-label="¿Ya compraste el apartamento?"
          >
            <button
              type="button"
              onClick={() => {
                setBasicFormError(null);
                setState((prev) => ({
                  ...prev,
                  alreadyPurchased: true,
                }));
              }}
              className={`flex-1 text-left px-5 py-4 border transition-all duration-500 rounded-sm ${
                state.alreadyPurchased === true
                  ? 'border-amber-500/80 bg-amber-500/10 text-white'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              <span className="text-[10px] font-mono text-amber-600/90 block mb-1">A</span>
              <span className="text-sm font-light tracking-tight">Sí, ya compré</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBasicFormError(null);
                setState((prev) => ({
                  ...prev,
                  alreadyPurchased: false,
                  apartmentSizeBand: null,
                }));
              }}
              className={`flex-1 text-left px-5 py-4 border transition-all duration-500 rounded-sm ${
                state.alreadyPurchased === false
                  ? 'border-amber-500/80 bg-amber-500/10 text-white'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              <span className="text-[10px] font-mono text-amber-600/90 block mb-1">B</span>
              <span className="text-sm font-light tracking-tight">Aún no he comprado</span>
            </button>
          </div>

          {state.alreadyPurchased === true ? (
            <div className="space-y-3 pt-2 border-t border-zinc-800/60">
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
                Superficie aproximada
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {APARTMENT_SIZE_BAND_ORDER.map((band) => (
                  <button
                    key={band}
                    type="button"
                    onClick={() => {
                      setBasicFormError(null);
                      setState((prev) => ({ ...prev, apartmentSizeBand: band }));
                    }}
                    className={`text-left px-4 py-3 border text-sm font-light tracking-tight transition-all rounded-sm ${
                      state.apartmentSizeBand === band
                        ? 'border-amber-500/80 bg-white text-black'
                        : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    {APARTMENT_SIZE_LABELS[band]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6 rounded-sm border border-zinc-800/80 bg-zinc-950/40 p-8 md:p-10">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500/90 font-bold">
              Ocupación del apartamento
            </span>
            <h3 className="text-2xl md:text-3xl font-light text-white tracking-tight">
              ¿Cuántas personas vivirán aquí?
            </h3>
            <p className="text-sm md:text-base text-zinc-500 font-light leading-relaxed max-w-2xl">
              Cuenta a todas las que habitarán el apartamento de forma habitual — adultos, niños y bebés. No incluyas visitas ocasionales.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <div className="flex items-stretch gap-0 border border-zinc-800 rounded-sm overflow-hidden bg-zinc-900/30">
              <button
                type="button"
                aria-label="Una persona menos"
                disabled={state.inhabitants <= 1}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    inhabitants: Math.max(1, prev.inhabitants - 1),
                  }))
                }
                className="px-5 py-5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors disabled:opacity-25 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-inset"
              >
                <Minus size={22} strokeWidth={1.5} aria-hidden />
              </button>
              <label className="sr-only" htmlFor="survey-inhabitants">
                Número de personas que vivirán en el apartamento
              </label>
              <input
                id="survey-inhabitants"
                required
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                value={state.inhabitants}
                onChange={(e) => {
                  const raw = e.target.value;
                  const n = parseInt(raw, 10);
                  if (raw === '') return;
                  if (Number.isNaN(n)) return;
                  setState((prev) => ({
                    ...prev,
                    inhabitants: Math.min(20, Math.max(1, n)),
                  }));
                }}
                className="w-[5.5rem] sm:w-24 bg-transparent py-5 text-center text-3xl md:text-4xl font-light text-white focus:outline-none focus-visible:bg-zinc-900/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                aria-label="Una persona más"
                disabled={state.inhabitants >= 20}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    inhabitants: Math.min(20, prev.inhabitants + 1),
                  }))
                }
                className="px-5 py-5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors disabled:opacity-25 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-inset"
              >
                <Plus size={22} strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <p
              className="text-lg md:text-xl text-zinc-300 font-light leading-snug"
              aria-live="polite"
            >
              {state.inhabitants === 1
                ? 'Vivirá 1 persona en el apartamento.'
                : `Vivirán ${state.inhabitants} personas en el apartamento.`}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Edades</label>
          <p className="text-sm text-zinc-600 font-light -mt-1">
            Una edad por cada persona (puedes separarlas con comas).
          </p>
          <input 
            required
            type="text" 
            value={state.ages}
            onChange={e => setState(prev => ({ ...prev, ages: e.target.value }))}
            className="w-full bg-transparent border-b border-zinc-800 py-6 text-3xl md:text-4xl font-light text-white focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-900"
            placeholder="Ej: 35, 32, 5"
          />
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

        {basicFormError ? (
          <p className="text-sm text-amber-500/90 font-light" role="alert">
            {basicFormError}
          </p>
        ) : null}

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
        className="max-w-4xl mx-auto h-[calc(100vh-96px)] md:h-[calc(100vh-112px)] py-6 px-6 flex flex-col overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="w-full h-0.5 bg-zinc-900 mb-6 relative overflow-hidden shrink-0">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
            className="absolute top-0 left-0 h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between min-h-0">
          <motion.div variants={itemVariants} className="text-center space-y-3 shrink-0">
            <img
              src="/logo-casa-pizano-2 vf.png"
              alt="Casa Pizano"
              className="h-7 w-auto mx-auto opacity-90"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span className="text-[10px] uppercase tracking-[0.5em] text-amber-500 font-bold">
              Espacio {state.currentStep} de {QUESTIONS.length}
            </span>
            <h2 className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">{question.title}</h2>
            <h3 className="text-2xl md:text-4xl font-light text-white leading-tight tracking-tighter uppercase max-w-3xl mx-auto">
              {question.question}
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 gap-2 max-w-2xl mx-auto w-full py-4">
            {question.options.map(option => (
              <motion.button
                key={option.id}
                variants={itemVariants}
                onClick={() => handleOptionSelect(question.id, option.id)}
                disabled={loading || isAdvancing}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-4 border transition-all duration-700 group relative overflow-hidden ${
                  selectedOptionId === option.id 
                    ? 'bg-white border-white text-black' 
                    : 'bg-transparent border-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-white hover:bg-zinc-950'
                }`}
              >
                <div className="flex items-center gap-5 relative z-10">
                  <span className={`text-[10px] font-mono ${selectedOptionId === option.id ? 'text-black' : 'text-zinc-700'}`}>
                    0{option.id}
                  </span>
                  <p className="text-sm md:text-base font-light tracking-tight">{option.text}</p>
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

          <motion.div variants={itemVariants} className="flex items-center justify-start pt-4 max-w-2xl mx-auto w-full shrink-0">
            <button
              onClick={prevStep}
              disabled={loading || isAdvancing}
              className="flex items-center gap-4 text-zinc-600 uppercase tracking-[0.3em] text-[10px] font-bold hover:text-white transition-all group disabled:opacity-10"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Anterior
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
    const profileOrder: ProfileType[] = [
      'Social',
      'Sensorial',
      'Práctico Funcional',
      'Visionario Sofisticado',
    ];
    const totalProfilePoints = Math.max(
      1,
      profileOrder.reduce((acc, k) => acc + (state.scores[k] ?? 0), 0)
    );
    const preferenceRows = QUESTIONS.flatMap((q) => {
      const optId = state.answers[q.id];
      const opt = q.options.find((o) => o.id === optId);
      return opt ? [{ q, opt }] : [];
    });

    return (
      <motion.div 
        key="results"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-black text-zinc-300"
      >
        <section className="relative shrink-0 flex items-center justify-center overflow-hidden px-6 py-16 min-h-[42vh] md:min-h-0 md:py-7 md:pb-5">
          <div className="absolute inset-0 bg-zinc-950/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_55%)]" />
          
          <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8 md:space-y-5">
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
              className="text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tighter uppercase leading-none"
            >
              {profileDef.title}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-2xl text-zinc-400 font-light italic max-w-3xl mx-auto leading-relaxed"
            >
              "{profileDef.description}"
            </motion.p>
          </div>
        </section>

        {/* Manifiesto encima del resumen de preferencias (ancho máx. 690px) */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative z-10 px-0 pt-2 pb-5 md:pt-0 md:pb-5"
        >
          <div className="mx-auto w-full max-w-[690px]">
            <div className="grid grid-cols-1 gap-[29px] items-start min-w-0">
              <div className="space-y-3 min-w-0">
                <span className="inline-block w-[134px] text-xs uppercase tracking-widest text-amber-500 font-bold">
                  Manifiesto
                </span>
                <h3 className="text-2xl md:text-3xl font-light text-white leading-snug">
                  El apartamento que sueñas habitado
                </h3>
                <div className="h-px bg-gradient-to-r from-amber-500/60 to-transparent w-14" />
                <p className="text-xs text-zinc-600 font-light leading-relaxed hidden md:block">
                  Redactado a partir de tus respuestas y de quienes comparten el hogar contigo.
                </p>
              </div>
              <div className="prose prose-invert prose-amber prose-lg max-w-none font-light leading-[1.75] text-zinc-300 [&_h2]:text-white [&_h2]:font-light [&_h2]:tracking-tight [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:mt-0 [&_h2]:mb-5 [&_p]:mb-4">
                {reports.clientReport ? (
                  <ReactMarkdown>{reports.clientReport}</ReactMarkdown>
                ) : (
                  <p className="text-zinc-500">Generando narrativa personalizada...</p>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <section className="px-6 pb-10 md:pb-3 relative z-10 md:mt-0">
          <div className="max-w-4xl mx-auto w-full rounded-sm border border-zinc-800/90 bg-zinc-950/60 backdrop-blur-sm overflow-hidden flex flex-col shadow-[0_0_0_1px_rgba(39,39,42,0.5)]">
            <div className="flex items-center gap-3 px-5 py-3 md:py-3.5 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
              <Layout className="text-amber-500 shrink-0" size={20} strokeWidth={1.5} aria-hidden />
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-bold">
                  Resumen de preferencias
                </h3>
                <p className="text-sm text-zinc-400 font-light mt-0.5 md:text-xs md:leading-snug">
                  Vista rápida de tus elecciones. En pantalla grande el listado se desplaza dentro del marco.
                </p>
              </div>
            </div>

            <div className="p-5 md:p-5 md:pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 md:items-stretch md:flex-1 md:min-h-0 md:overflow-hidden">
              <div className="md:col-span-5 space-y-5 md:min-h-0 md:overflow-y-auto md:overflow-x-hidden md:pr-2 md:max-h-full
                [scrollbar-width:thin]
                [scrollbar-color:rgba(82,82,91,0.9)_rgb(9,9,11)]
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-zinc-950
                [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">Contexto</p>
                  <ul className="text-sm text-zinc-300 font-light space-y-1.5">
                    <li><span className="text-zinc-500">Nombre</span> — {state.userName || '—'}</li>
                    <li>
                      <span className="text-zinc-500">Compra</span> —{' '}
                      {state.alreadyPurchased === true
                        ? 'Ya compró'
                        : state.alreadyPurchased === false
                          ? 'Aún no compra'
                          : '—'}
                      {state.alreadyPurchased === true && state.apartmentSizeBand ? (
                        <span className="text-zinc-400">
                          {' '}
                          · {APARTMENT_SIZE_LABELS[state.apartmentSizeBand]}
                        </span>
                      ) : null}
                    </li>
                    <li>
                      <span className="text-zinc-500">Hogar</span> —{' '}
                      {state.inhabitants === 1
                        ? '1 persona'
                        : `${state.inhabitants} personas`}
                      {state.ages ? ` · ${state.ages}` : ''}
                    </li>
                    {state.pets ? (
                      <li><span className="text-zinc-500">Mascotas</span> — {state.pets}</li>
                    ) : null}
                  </ul>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                      className="relative mx-auto sm:mx-0 shrink-0"
                    >
                      {(() => {
                        let angle = 0;
                        const stops: string[] = [];
                        profileOrder.forEach((key) => {
                          const val = state.scores[key] ?? 0;
                          if (val <= 0) return;
                          const span = (val / totalProfilePoints) * 360;
                          const end = angle + span;
                          stops.push(`${PROFILE_CHART[key].hex} ${angle}deg ${end}deg`);
                          angle = end;
                        });
                        const cone =
                          stops.length > 0
                            ? `conic-gradient(${stops.join(', ')})`
                            : 'conic-gradient(#3f3f46 0deg 360deg)';
                        const domVal = state.scores[dominantProfile] ?? 0;
                        const dominantPct = Math.round((domVal / totalProfilePoints) * 100);
                        return (
                          <div className="relative h-[7.5rem] w-[7.5rem] shrink-0">
                            <div
                              className="absolute inset-0 rounded-full ring-2 ring-zinc-700/90 ring-offset-4 ring-offset-zinc-950 shadow-[0_0_48px_rgba(245,158,11,0.14)]"
                              style={{ background: cone }}
                              aria-hidden
                            />
                            <div className="absolute inset-[17%] flex flex-col items-center justify-center rounded-full bg-zinc-950 border border-zinc-800/80 shadow-[inset_0_2px_16px_rgba(0,0,0,0.55)]">
                              <span className="text-2xl font-light tabular-nums text-white leading-none">
                                {dominantPct}%
                              </span>
                              <span className="text-[9px] uppercase tracking-[0.2em] text-amber-500 font-bold mt-1 text-center px-1 leading-tight">
                                {PROFILE_CHART[dominantProfile].label}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
                        Composición de tu perfil
                      </p>
                      <p className="text-xs text-zinc-500 font-light leading-relaxed">
                        Cada color es un matiz de cómo habitas el espacio. El anillo resume la mezcla; las barras, el detalle.
                      </p>
                      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                        {profileOrder.map((key) => (
                          <li key={key} className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <span
                              className="h-2 w-2 rounded-full shrink-0 ring-1 ring-white/20"
                              style={{ backgroundColor: PROFILE_CHART[key].hex }}
                            />
                            <span className="font-medium text-zinc-300">{PROFILE_CHART[key].label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {profileOrder.map((key, index) => {
                      const val = state.scores[key] ?? 0;
                      const pct = Math.round((val / totalProfilePoints) * 100);
                      const isTop = key === dominantProfile;
                      const chart = PROFILE_CHART[key];
                      return (
                        <motion.li
                          key={key}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.06 * index, duration: 0.45 }}
                        >
                          <div className="flex justify-between items-baseline gap-3 text-xs mb-2">
                            <span
                              className={`font-medium tracking-tight ${
                                isTop ? 'text-white' : 'text-zinc-400'
                              }`}
                            >
                              {PROFILE_DEFINITIONS[key]?.title ?? key}
                            </span>
                            <span
                              className={`tabular-nums shrink-0 ${
                                isTop ? 'text-amber-400' : 'text-zinc-500'
                              }`}
                            >
                              <span className="text-lg font-light">{pct}</span>
                              <span className="text-zinc-600 text-[10px] ml-1">% · {val} pts</span>
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-zinc-800/90 overflow-hidden ring-1 ring-zinc-700/50">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{
                                duration: 1.15,
                                delay: 0.08 * index,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                              className={`h-full rounded-full ${chart.gradient} ${
                                isTop ? chart.glow : 'opacity-[0.92]'
                              }`}
                            />
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="md:col-span-7 flex min-h-[min(22rem,50vh)] flex-col md:min-h-0 md:h-full md:max-h-full">
                <div className="flex h-full min-h-[min(22rem,50vh)] flex-1 flex-col overflow-hidden rounded-sm border border-zinc-600/70 bg-zinc-900/60 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] md:min-h-0 md:max-h-full">
                  <div className="shrink-0 border-b border-zinc-700/90 bg-zinc-950/90 px-3 py-2.5 md:px-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">
                      Por tema
                    </p>
                    <p className="text-[11px] text-zinc-500 font-light mt-1 leading-snug">
                      Hay más respuestas abajo — desplázate dentro de este panel.
                    </p>
                  </div>
                  <div
                    className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 md:px-4 md:py-4 space-y-2.5
                      [scrollbar-width:thin]
                      [scrollbar-color:rgba(180,83,9,0.65)_rgb(24,24,27)]
                      [&::-webkit-scrollbar]:w-2
                      [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-zinc-950
                      [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600
                      [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-zinc-800
                      hover:[&::-webkit-scrollbar-thumb]:bg-amber-700/80"
                  >
                    {preferenceRows.map(({ q, opt }) => (
                      <div
                        key={q.id}
                        className="rounded-sm border border-zinc-700/80 bg-zinc-950/70 px-3 py-2.5 text-left shadow-sm"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-mono text-amber-500/95 shrink-0 mt-0.5">
                            {opt.id}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                              {q.title}
                            </p>
                            <p className="text-xs text-zinc-200/90 font-light leading-snug mt-1">
                              {opt.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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

      <header className="relative z-10 p-6 md:p-8 flex justify-between items-center">
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
          <img
            src="/logo-casa-pizano-2 vf.png"
            alt="Casa Pizano"
            className="h-16 w-auto mb-8"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <Loader2 className="animate-spin text-amber-500 mb-6" size={64} />
          <h2 className="text-2xl font-light text-white uppercase tracking-[0.3em]">Generando tu informe</h2>
          <p className="text-zinc-500 mt-4 font-mono text-xs text-center px-6">
            Estamos generando tu informe personalizado y visualizaciones fotorrealistas...
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
