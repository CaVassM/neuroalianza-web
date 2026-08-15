import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { StepProgress } from '../components/StepProgress';
import { CustomSelect } from '../components/CustomSelect';
import { LocationData } from '../types';
import { PERU_DEPARTMENTS, LIMA_DISTRICTS } from '../constants/data';
import { motion } from 'motion/react';
import { MapPin, Navigation } from 'lucide-react';

interface RegisterStep2Props {
  initialData: LocationData;
  onNext: (data: LocationData) => void;
  onBack: () => void;
  onGoToLogin: () => void;
}

export const RegisterStep2: React.FC<RegisterStep2Props> = ({
  initialData,
  onNext,
  onBack,
  onGoToLogin,
}) => {
  const [department, setDepartment] = useState(initialData.department || 'Lima');
  const [province, setProvince] = useState(initialData.province || 'Lima');
  const [district, setDistrict] = useState(initialData.district || 'Miraflores');

  const provincesByDepartment: Record<string, string[]> = {
    Lima: ['Lima', 'Cañete', 'Huaral', 'Barranca', 'Huaura', 'Canta', 'Yauyos', 'Huarochirí', 'Oyón'],
    Callao: ['Callao'],
    Arequipa: ['Arequipa', 'Camaná', 'Caylloma', 'Islay'],
    Cusco: ['Cusco', 'Urubamba', 'Calca', 'Anta', 'Espinar'],
    'La Libertad': ['Trujillo', 'Ascope', 'Pacasmayo', 'Chepén', 'Sánchez Carrión'],
    Piura: ['Piura', 'Sullana', 'Talara', 'Paita', 'Morropón'],
    Lambayeque: ['Chiclayo', 'Lambayeque', 'Ferreñafe'],
    Junín: ['Huancayo', 'Chanchamayo', 'Tarma', 'Satipo', 'Jauja'],
    Áncash: ['Huaraz', 'Santa (Chimbote)', 'Huari', 'Casma', 'Huarmey'],
    Ica: ['Ica', 'Chincha', 'Pisco', 'Nazca', 'Palpa'],
  };

  const provinceOptions = provincesByDepartment[department] || ['Lima', 'Callao', 'Cañete', 'Huaral'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      department,
      province,
      district: district || 'Miraflores',
    });
  };

  return (
    <div className="flex-1 bg-[#F7F5FA] flex flex-col items-center pt-8 pb-12 px-4 sm:px-6">
      {/* Top Header with Logo */}
      <div className="w-full flex justify-center mb-6">
        <Logo onClick={onGoToLogin} size="md" />
      </div>

      {/* Main Card */}
      <motion.div 
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[640px] bg-white rounded-2xl border border-[#E5E1EC] p-7 sm:p-11 shadow-sm"
      >
        <StepProgress currentStep={2} onStepClick={(s) => s === 1 && onBack()} />

        <h2 className="text-[28px] sm:text-[32px] font-fraunces font-bold text-[#2E2A33] mb-8">
          ¿Dónde viven?
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Departamento */}
          <div>
            <CustomSelect
              label="Departamento"
              value={department}
              onChange={(val) => {
                setDepartment(val);
                const nextProvinces = provincesByDepartment[val] || ['Principal'];
                setProvince(nextProvinces[0] || val);
              }}
              options={PERU_DEPARTMENTS}
              placeholder="Selecciona departamento"
            />
          </div>

          {/* Provincia */}
          <div>
            <CustomSelect
              label="Provincia"
              value={province}
              onChange={setProvince}
              options={provinceOptions}
              placeholder="Selecciona provincia"
            />
          </div>

          {/* Distrito */}
          <div>
            <CustomSelect
              label="Distrito"
              value={district}
              onChange={setDistrict}
              options={LIMA_DISTRICTS}
              placeholder="Busca o elige tu distrito"
              searchable={true}
              helperText="Usamos tu distrito para mostrarte los establecimientos de salud y centros comunitarios más cercanos."
            />
          </div>

          {/* Quick Info Box */}
          <div className="bg-[#FAF8FD] border border-[#E5E1EC] rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E9DFF5] flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4 text-[#4A2270]" />
            </div>
            <p className="text-[13px] text-[#6E6A75] leading-relaxed">
              Seleccionaste: <span className="font-semibold text-[#2E2A33]">{district || 'Miraflores'}, {province}, {department}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3.5 bg-white border border-[#E5E1EC] text-[#2E2A33] text-[15px] font-semibold rounded-xl hover:bg-[#F7F5FA] active:scale-[0.98] transition-all cursor-pointer"
            >
              Atrás
            </button>

            <button
              type="submit"
              className="px-8 py-3.5 bg-[#4A2270] hover:bg-[#381559] active:scale-[0.98] text-white text-[15px] font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              Continuar
            </button>
          </div>
        </form>
      </motion.div>

      <div className="text-center pt-8 pb-4">
        <p className="text-[12px] text-[#6E6A75]">PAN orienta a familias y no realiza diagnósticos.</p>
      </div>
    </div>
  );
};
