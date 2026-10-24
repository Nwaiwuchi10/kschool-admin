'use client';

import React, { useState } from 'react';
import { Calculator, Zap, FlaskConical, Brain, TrendingUp, Sparkles } from 'lucide-react';

interface FormulaToolbarProps {
  onInsert: (snippet: string) => void;
}

interface FormulaItem {
  label: string;
  latex: string;
  preview: string;
  description: string;
}

export const FormulaToolbar: React.FC<FormulaToolbarProps> = ({ onInsert }) => {
  const [activeCategory, setActiveCategory] = useState<string>('math');

  const categories: Record<string, { title: string; icon: any; items: FormulaItem[] }> = {
    math: {
      title: 'Mathematics',
      icon: Calculator,
      items: [
        { label: 'Fraction', latex: '$\\frac{a}{b}$', preview: 'a/b', description: 'Fraction' },
        { label: 'Square Root', latex: '$\\sqrt{x}$', preview: '√x', description: 'Square root' },
        { label: 'Nth Root', latex: '$\\sqrt[n]{x}$', preview: 'ⁿ√x', description: 'N-th root' },
        { label: 'Power (x²)', latex: '$x^{2}$', preview: 'x²', description: 'Superscript exponent' },
        { label: 'Power (xⁿ)', latex: '$x^{n}$', preview: 'xⁿ', description: 'N-th power' },
        { label: 'Subscript (x₂)', latex: '$x_{2}$', preview: 'x₂', description: 'Subscript place value' },
        { label: 'Plus/Minus', latex: '$\\pm$', preview: '±', description: 'Plus-minus sign' },
        { label: 'Multiply', latex: '$\\times$', preview: '×', description: 'Multiplication sign' },
        { label: 'Divide', latex: '$\\div$', preview: '÷', description: 'Division sign' },
        { label: 'Pi (π)', latex: '$\\pi$', preview: 'π', description: 'Circle constant pi' },
        { label: 'Summation', latex: '$\\sum_{i=1}^{n} x_i$', preview: '∑', description: 'Summation sigma' },
        { label: 'Quadratic Formula', latex: '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$', preview: 'x = (-b±√Δ)/2a', description: 'Quadratic equation solution' },
        { label: 'Base 2 Notation', latex: '$1101_{2} = 13_{10}$', preview: '1101₂ = 13₁₀', description: 'Number base conversion' },
      ],
    },
    physics: {
      title: 'Physics',
      icon: Zap,
      items: [
        { label: 'v = u + at', latex: '$$v = u + at$$', preview: 'v = u + at', description: 'Velocity-time formula' },
        { label: 's = ut + ½at²', latex: '$$s = ut + \\frac{1}{2}at^2$$', preview: 's = ut + ½at²', description: 'Kinematic displacement' },
        { label: 'v² = u² + 2as', latex: '$$v^2 = u^2 + 2as$$', preview: 'v² = u² + 2as', description: 'Kinematics without time' },
        { label: 'F = ma', latex: '$$F = ma$$', preview: 'F = ma', description: 'Newton second law' },
        { label: 'Work (W = Fs)', latex: '$$W = F \\times s$$', preview: 'W = F × s', description: 'Mechanical work done' },
        { label: 'Kinetic Energy', latex: '$$E_k = \\frac{1}{2}mv^2$$', preview: 'Ek = ½mv²', description: 'Kinetic energy' },
        { label: 'Potential Energy', latex: '$$E_p = mgh$$', preview: 'Ep = mgh', description: 'Gravitational potential energy' },
        { label: 'E = mc²', latex: '$$E = mc^2$$', preview: 'E = mc²', description: 'Einstein mass-energy' },
        { label: "Ohm's Law (V=IR)", latex: '$$V = I \\times R$$', preview: 'V = I × R', description: 'Electrical potential difference' },
        { label: 'Wave (v = fλ)', latex: '$$v = f \\times \\lambda$$', preview: 'v = fλ', description: 'Wave speed equation' },
        { label: 'Density (ρ = m/V)', latex: '$$\\rho = \\frac{m}{V}$$', preview: 'ρ = m/V', description: 'Mass density' },
      ],
    },
    chemistry: {
      title: 'Chemistry',
      icon: FlaskConical,
      items: [
        { label: 'Water (H₂O)', latex: '$\\text{H}_2\\text{O}$', preview: 'H₂O', description: 'Water molecule' },
        { label: 'Carbon Dioxide', latex: '$\\text{CO}_2$', preview: 'CO₂', description: 'Carbon dioxide molecule' },
        { label: 'Sulfate Ion', latex: '$\\text{SO}_4^{2-}$', preview: 'SO₄²⁻', description: 'Sulfate polyatomic ion' },
        { label: 'Hydrogen Reaction', latex: '$$\\text{2H}_2 + \\text{O}_2 \\rightarrow \\text{2H}_2\\text{O}$$', preview: '2H₂ + O₂ → 2H₂O', description: 'Synthesis reaction' },
        { label: 'Equilibrium (Haber)', latex: '$$\\text{N}_2 + \\text{3H}_2 \\rightleftharpoons \\text{2NH}_3$$', preview: 'N₂ + 3H₂ ⇌ 2NH₃', description: 'Reversible equilibrium' },
        { label: 'pH Formula', latex: '$$\\text{pH} = -\\log[\\text{H}^+]$$', preview: 'pH = -log[H⁺]', description: 'Acidity scale' },
        { label: 'Ideal Gas (PV=nRT)', latex: '$$PV = nRT$$', preview: 'PV = nRT', description: 'Ideal gas law' },
        { label: 'Enthalpy (ΔH)', latex: '$\\Delta H$', preview: 'ΔH', description: 'Heat of reaction' },
      ],
    },
    quantitative: {
      title: 'Quantitative & Logic',
      icon: Brain,
      items: [
        { label: 'Proportional (∝)', latex: '$\\propto$', preview: '∝', description: 'Directly proportional to' },
        { label: 'Approx Equal (≈)', latex: '$\\approx$', preview: '≈', description: 'Approximately equal' },
        { label: 'Not Equal (≠)', latex: '$\\neq$', preview: '≠', description: 'Not equal' },
        { label: 'Element of (∈)', latex: '$\\in$', preview: '∈', description: 'Belongs to set' },
        { label: 'Subset (⊂)', latex: '$\\subset$', preview: '⊂', description: 'Proper subset' },
        { label: 'Union (∪)', latex: '$\\cup$', preview: '∪', description: 'Set union' },
        { label: 'Intersection (∩)', latex: '$\\cap$', preview: '∩', description: 'Set intersection' },
        { label: 'Therefore (∴)', latex: '$\\therefore$', preview: '∴', description: 'Logical therefore' },
        { label: 'Implies (⟹)', latex: '$\\implies$', preview: '⟹', description: 'Logical implication' },
        { label: 'Ratio Puzzle Pattern', latex: '$$\\frac{A \\times B}{C} = D$$', preview: '(A × B)/C = D', description: 'Quantitative reasoning formula' },
      ],
    },
    economics: {
      title: 'Economics & Statistics',
      icon: TrendingUp,
      items: [
        { label: 'Mean (x̄)', latex: '$$\\bar{x} = \\frac{\\sum x}{n}$$', preview: 'x̄ = ∑x/n', description: 'Arithmetic mean' },
        { label: 'Standard Deviation (σ)', latex: '$$\\sigma = \\sqrt{\\frac{\\sum (x - \\bar{x})^2}{N}}$$', preview: 'σ = √(∑(x-x̄)²/N)', description: 'Population standard deviation' },
        { label: 'Elasticity of Demand', latex: '$$E_d = \\frac{\\% \\Delta Q_d}{\\% \\Delta P}$$', preview: 'Ed = %ΔQ / %ΔP', description: 'Price elasticity of demand' },
        { label: 'Profit Equation', latex: '$$\\text{Profit} = \\text{Total Revenue} - \\text{Total Cost}$$', preview: 'Profit = TR - TC', description: 'Accounting profit formula' },
        { label: 'National Income (GDP)', latex: '$$\\text{GDP} = C + I + G + (X - M)$$', preview: 'GDP = C+I+G+(X-M)', description: 'Expenditure approach GDP' },
      ],
    },
  };

  return (
    <div className="mb-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-900">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Universal Subject Formulas & Symbols Palette</span>
        </div>
        <span className="text-[11px] text-gray-500">
          Tip: Wrap math in <code className="rounded bg-indigo-100/70 px-1 py-0.5 font-mono text-indigo-700">$...$</code> for inline or <code className="rounded bg-indigo-100/70 px-1 py-0.5 font-mono text-indigo-700">$$...$$</code> for centered equations
        </span>
      </div>

      {/* Category Tabs */}
      <div className="mb-2.5 flex flex-wrap gap-1.5 border-b border-indigo-100 pb-2">
        {Object.entries(categories).map(([key, cat]) => {
          const Icon = cat.icon;
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/80 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Formula Buttons */}
      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
        {categories[activeCategory]?.items.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onInsert(item.latex)}
            title={`${item.description} (Click to insert: ${item.latex})`}
            className="group flex items-center gap-1.5 rounded-md border border-indigo-200/60 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-xs transition hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-900 active:scale-95"
          >
            <span className="font-mono text-indigo-600 group-hover:text-indigo-800">{item.preview}</span>
            <span className="text-[11px] text-gray-400 group-hover:text-gray-600">({item.label})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FormulaToolbar;
