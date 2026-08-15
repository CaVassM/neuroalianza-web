import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  label,
  error,
  helperText,
  disabled = false,
  searchable = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to object format
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filter options if searchable
  const filteredOptions = searchable && searchQuery.trim()
    ? normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : normalizedOptions;

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef} id={id}>
      {label && (
        <label className="block text-[14px] font-semibold text-[#2E2A33] mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'border-[#4A2270] bg-white ring-2 ring-[#4A2270]/20 shadow-sm'
            : 'border-[#E5E1EC] bg-white hover:border-[#4A2270]/50 hover:bg-[#FAF8FD]'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''} ${
          error ? 'border-red-500 ring-1 ring-red-500' : ''
        }`}
      >
        <span
          className={`block truncate text-[15px] ${
            selectedOption
              ? 'text-[#2E2A33] font-medium'
              : 'text-[#6E6A75]/70 font-normal'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-[#6E6A75] transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-[#4A2270]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-[#E5E1EC] rounded-xl shadow-xl overflow-hidden max-h-64 flex flex-col"
          >
            {/* Search Box if searchable */}
            {searchable && (
              <div className="p-2 border-b border-[#E5E1EC] bg-[#FAF8FD] sticky top-0 z-10 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#6E6A75] ml-1 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar opción..."
                  className="w-full bg-transparent text-[13px] font-medium text-[#2E2A33] placeholder-[#6E6A75]/60 focus:outline-none py-1"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-[#E5E1EC] rounded text-[#6E6A75]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto py-1.5 max-h-56 scrollbar-thin divide-y divide-gray-50">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-center text-xs text-[#6E6A75]">
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full px-4 py-2.5 text-left text-[14px] flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#F0EBF8] text-[#4A2270] font-semibold'
                          : 'text-[#2E2A33] hover:bg-[#F7F5FA]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                        {opt.sublabel && (
                          <span className="text-[11px] text-[#6E6A75] font-normal">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#4A2270] stroke-[2.5] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-[13px] text-[#6E6A75]">{helperText}</p>
      )}
    </div>
  );
};
