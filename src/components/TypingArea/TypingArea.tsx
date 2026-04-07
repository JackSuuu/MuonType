import React, { useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSettingsStore } from '../../stores/settingsStore'
import type { TypingViewState } from '../../hooks/useTypingEngine'
import clsx from 'clsx'

interface TypingAreaProps {
  viewState: TypingViewState
  testState: string
}

const FONT_SIZE_MAP = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
}

const LINE_HEIGHT = 'leading-[2.6em]'
const WORDS_PER_LINE = 9

// Single word rendering — memoized
const WordSpan = React.memo(function WordSpan({
  word,
  isCurrentWord,
  isPastWord,
  typedWord,
  blindMode,
}: {
  word: { original: string; chars: { char: string; status: string }[]; isCompleted: boolean; hasError: boolean }
  isCurrentWord: boolean
  isPastWord: boolean
  typedWord: string
  blindMode: boolean
}) {
  return (
    <span
      className={clsx('relative inline-block', isCurrentWord && 'rounded')}
      style={isCurrentWord ? {
        background: 'rgba(255,255,255,0.03)',
        outline: '1px solid var(--border)',
        paddingLeft: '1px',
        paddingRight: '1px',
      } : undefined}
    >
      {word.chars.map((charData, charIdx) => {
        const isCurrentChar = isCurrentWord && charIdx === typedWord.length

        let statusClass = 'char-pending'
        if (blindMode && isPastWord) {
          statusClass = 'char-correct'
        } else if (charData.status === 'correct') {
          statusClass = 'char-correct'
        } else if (charData.status === 'error') {
          statusClass = 'char-error'
        }

        return (
          <span
            key={charIdx}
            className={clsx(statusClass, isCurrentChar && 'char-cursor')}
          >
            {charData.char}
          </span>
        )
      })}

      {/* Extra typed characters */}
      {isCurrentWord && typedWord.length > word.original.length && (
        <span className="char-extra">
          {typedWord.slice(word.original.length)}
        </span>
      )}

      {/* Cursor at end of word */}
      {isCurrentWord && typedWord.length === word.original.length && (
        <span className="char-cursor" style={{ width: 0 }}>&nbsp;</span>
      )}
    </span>
  )
})

export const TypingArea: React.FC<TypingAreaProps> = ({ viewState, testState }) => {
  const { blindMode, fontSize } = useSettingsStore()
  const { words, currentWordIndex, typedWord } = viewState

  // Track which display-line we're on to animate when it scrolls
  const currentLine = Math.floor(currentWordIndex / WORDS_PER_LINE)
  const prevLineRef = useRef(currentLine)
  const lineChanged = currentLine !== prevLineRef.current
  if (lineChanged) prevLineRef.current = currentLine

  const VISIBLE_LINES = 3
  const visibleSlice = useMemo(() => {
    const startLine = Math.max(0, currentLine - 1)
    const startIdx = startLine * WORDS_PER_LINE
    const endIdx = Math.min(words.length, (startLine + VISIBLE_LINES) * WORDS_PER_LINE)
    return { words: words.slice(startIdx, endIdx), offset: startIdx }
  }, [words, currentLine])

  if (words.length === 0) return null

  return (
    <div
      className={clsx(
        'relative font-mono select-none',
        FONT_SIZE_MAP[fontSize],
        LINE_HEIGHT,
      )}
      style={{ color: 'var(--subtext)' }}
    >
      {/* Use currentLine as key so the word block animates in when lines scroll */}
      <motion.div
        key={Math.max(0, currentLine - 1)}
        initial={lineChanged ? { opacity: 0.6, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="flex flex-wrap gap-x-[0.6em] gap-y-0 overflow-hidden"
        style={{ maxHeight: `calc(2.6em * ${VISIBLE_LINES})` }}
      >
        {visibleSlice.words.map((word, relIdx) => {
          const wordIdx = relIdx + visibleSlice.offset
          const isCurrentWord = wordIdx === currentWordIndex
          const isPastWord = wordIdx < currentWordIndex

          return (
            <WordSpan
              key={wordIdx}
              word={word}
              isCurrentWord={isCurrentWord}
              isPastWord={isPastWord}
              typedWord={isCurrentWord ? typedWord : ''}
              blindMode={blindMode}
            />
          )
        })}
      </motion.div>

      {/* Idle hint */}
      <AnimatePresence>
        {testState === 'idle' && words.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span
              className="font-mono text-sm"
              style={{ color: 'var(--subtext)', opacity: 0.4 }}
            >
              start typing...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TypingArea
