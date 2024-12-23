'use client';
import { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

type TaxYear = '2024' | '2025';
type FilingStatus = 'Single' | 'Head of Household' | 'Married Filing Jointly' | 'Married Filing Separately';

const AMT_PHASEOUT_THRESHOLDS = {
    '2024': {
        'Single': 609350,
        'Head of Household': 609350,
        'Married Filing Jointly': 1218700,
        'Married Filing Separately': 609350
    },
    '2025': {
        'Single': 626350,
        'Head of Household': 626350,
        'Married Filing Jointly': 1252700,
        'Married Filing Separately': 626350
    }
};

const AMT_EXEMPTIONS = {
    '2024': {
        'Single': 85700,
        'Head of Household': 85700,
        'Married Filing Jointly': 133300,
        'Married Filing Separately': 66650
    },
    '2025': {
        'Single': 88100,
        'Head of Household': 88100,
        'Married Filing Jointly': 137000,
        'Married Filing Separately': 68500
    }
};

const AMT_RATE_THRESHOLDS = {
    '2024': {
        'Single': 232600,
        'Head of Household': 232600,
        'Married Filing Jointly': 232600,
        'Married Filing Separately': 116300
    },
    '2025': {
        'Single': 239100,
        'Head of Household': 239100,
        'Married Filing Jointly': 239100,
        'Married Filing Separately': 119550
    }
};

const TAX_BRACKETS = {
    '2024': {
        'Single': [
            { rate: 0.10, threshold: 0 },
            { rate: 0.12, threshold: 11600 },
            { rate: 0.22, threshold: 47150 },
            { rate: 0.24, threshold: 100525 },
            { rate: 0.32, threshold: 191950 },
            { rate: 0.35, threshold: 243725 },
            { rate: 0.37, threshold: 609350 }
        ],
        'Head of Household': [
            { rate: 0.10, threshold: 0 },
            { rate: 0.12, threshold: 16550 },
            { rate: 0.22, threshold: 63100 },
            { rate: 0.24, threshold: 100500 },
            { rate: 0.32, threshold: 191950 },
            { rate: 0.35, threshold: 243700 },
            { rate: 0.37, threshold: 609350 }
        ],
        'Married Filing Jointly': [
            { rate: 0.10, threshold: 0 },
            { rate: 0.12, threshold: 23200 },
            { rate: 0.22, threshold: 94300 },
            { rate: 0.24, threshold: 201050 },
            { rate: 0.32, threshold: 383900 },
            { rate: 0.35, threshold: 487450 },
            { rate: 0.37, threshold: 731200 }
        ],
        'Married Filing Separately': [
            { rate: 0.10, threshold: 0 },
            { rate: 0.12, threshold: 11600 },
            { rate: 0.22, threshold: 47150 },
            { rate: 0.24, threshold: 100525 },
            { rate: 0.32, threshold: 191950 },
            { rate: 0.35, threshold: 243725 },
            { rate: 0.37, threshold: 365600 }
        ]
    },
    '2025': {
        'Single': [
            { rate: 0.10, threshold: 0 },
            { rate: 0.12, threshold: 11925 },
            { rate: 0.22, threshold: 48475 },
            { rate: 0.24, threshold: 103350 },
            { rate: 0.32, threshold: 197300 },
            { rate: 0.35, threshold: 250525 },
            { rate: 0.37, threshold: 626350 }
        ],
        'Head of Household': [
            { rate: 0.10, threshold: 0 },
            { rate: 0.12, threshold: 17000 },
            { rate: 0.22, threshold: 64850 },
            { rate: 0.24, threshold: 103350 },
            { rate: 0.32, threshold: 197300 },
            { rate: 0.35, threshold: 250500 },
            { rate: 0.37, threshold: 626350 }
        ],
        'Married Filing Jointly': [
            { rate: 0.10, threshold: 0 },
            { rate: 0.12, threshold: 23850 },
            { rate: 0.22, threshold: 96950 },
            { rate: 0.24, threshold: 206700 },
            { rate: 0.32, threshold: 394600 },
            { rate: 0.35, threshold: 501050 },
            { rate: 0.37, threshold: 751600 }
        ],
        'Married Filing Separately': [
            { rate: 0.10, threshold: 0 },
            { rate: 0.12, threshold: 11925 },
            { rate: 0.22, threshold: 48475 },
            { rate: 0.24, threshold: 103350 },
            { rate: 0.32, threshold: 197300 },
            { rate: 0.35, threshold: 250525 },
            { rate: 0.37, threshold: 375800 }
        ]
    }
};

const STANDARD_DEDUCTIONS = {
    '2024': {
        'Single': 14600,
        'Head of Household': 21900,
        'Married Filing Jointly': 29200,
        'Married Filing Separately': 14600
    },
    '2025': {
        'Single': 15000,
        'Head of Household': 22500,
        'Married Filing Jointly': 30000,
        'Married Filing Separately': 15000
    }
};

export default function OptionCalculator() {
    const [inputs, setInputs] = useState<{
        taxYear: TaxYear;
        annualIncome: string;
        numISOs: string;
        strikePrice: string;
        shareValue: string;
        filingStatus: FilingStatus;
    }>({
        taxYear: '2024',
        annualIncome: '150000',
        numISOs: '1000',
        strikePrice: '5.00',
        shareValue: '25.00',
        filingStatus: 'Single'
    });

    const [results, setResults] = useState({
        income: 215000,
        adjustment: 9000,
        amtIncome: 224000,
        amtExemption: AMT_EXEMPTIONS['2024']['Single'],
        amtBase: 148100,
        tentativeMinTax: 38506,
        ordinaryIncomeTax: 51600,
        payableTax: 51600
    });

    const [showExemptionTooltip, setShowExemptionTooltip] = useState(false);
    const [showTaxRateTooltip, setShowTaxRateTooltip] = useState(false);
    const [showTaxCalcTooltip, setShowTaxCalcTooltip] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateOrdinaryTax = (income: number, filingStatus: FilingStatus, taxYear: TaxYear) => {
        const standardDeduction = STANDARD_DEDUCTIONS[taxYear][filingStatus];
        const taxableIncome = Math.max(0, income - standardDeduction);
        const brackets = TAX_BRACKETS[taxYear][filingStatus];

        let totalTax = 0;

        for (let i = 0; i < brackets.length; i++) {
            const currentBracket = brackets[i];
            const nextBracket = brackets[i + 1];
            const bracketStart = currentBracket.threshold;
            const bracketEnd = nextBracket ? nextBracket.threshold : Infinity;
            const incomeInBracket = Math.min(
                Math.max(0, taxableIncome - bracketStart),
                bracketEnd - bracketStart
            );

            totalTax += incomeInBracket * currentBracket.rate;

            if (taxableIncome <= bracketEnd) break;
        }

        return Math.round(totalTax);
    };

    useEffect(() => {
        const income = parseFloat(inputs.annualIncome) || 0;
        const numShares = parseFloat(inputs.numISOs) || 0;
        const strikePrice = parseFloat(inputs.strikePrice) || 0;
        const fairMarketValue = parseFloat(inputs.shareValue) || 0;

        const adjustment = (fairMarketValue - strikePrice) * numShares;
        const amtIncome = income + adjustment;

        let amtExemption = AMT_EXEMPTIONS[inputs.taxYear][inputs.filingStatus];
        const phaseoutThreshold = AMT_PHASEOUT_THRESHOLDS[inputs.taxYear][inputs.filingStatus];

        if (amtIncome > phaseoutThreshold) {
            const reduction = (amtIncome - phaseoutThreshold) * 0.25;
            amtExemption = Math.max(0, amtExemption - reduction);
        }

        const amtBase = Math.max(0, amtIncome - amtExemption);
        const amtRate = amtBase <= AMT_RATE_THRESHOLDS[inputs.taxYear][inputs.filingStatus] ? 0.26 : 0.28;
        const tentativeMinTax = amtBase * amtRate;
        const ordinaryIncomeTax = calculateOrdinaryTax(income, inputs.filingStatus, inputs.taxYear);
        const payableTax = Math.max(tentativeMinTax, ordinaryIncomeTax);

        setResults({
            income,
            adjustment,
            amtIncome,
            amtBase,
            amtExemption,
            tentativeMinTax,
            ordinaryIncomeTax,
            payableTax
        });
    }, [inputs]);

    return (
        <div className="max-w-6xl mx-auto p-2 sm:p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                        ISO Exercise Calculator with AMT Implications
                    </h1>

                    <p className="text-xs sm:text-sm mb-4 text-gray-700">
                        This calculator helps you understand the potential Alternative Minimum Tax (AMT) implications when exercising Incentive Stock Options (ISOs). My (updated) version of {' '}
                        <a
                            href="https://erikbarbara.github.io/iso-amt-calculator/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            Erik Barbara
                        </a>
                        's calc, which I recommend for a written explanation.
                    </p>

                    <div className="bg-white rounded-lg p-3 sm:p-6 border border-gray-200">
                        <h2 className="text-base sm:text-lg font-medium mb-4 text-gray-900">Input Parameters</h2>

                        <div className="space-y-3 sm:space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <label className="text-xs sm:text-sm text-gray-700">Tax Year</label>
                                </div>
                                <div className="relative">
                                    <select
                                        name="taxYear"
                                        value={inputs.taxYear}
                                        onChange={handleInputChange}
                                        className="w-full p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-900 border border-gray-200 appearance-none"
                                    >
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 sm:h-4 w-3 sm:w-4" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <label className="text-xs sm:text-sm text-gray-700">Adjusted Gross Income</label>
                                </div>
                                <input
                                    type="text"
                                    name="annualIncome"
                                    value={inputs.annualIncome}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-900 border border-gray-200"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <label className="text-xs sm:text-sm text-gray-700">Number of ISOs to Exercise</label>
                                </div>
                                <input
                                    type="text"
                                    name="numISOs"
                                    value={inputs.numISOs}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-900 border border-gray-200"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <label className="text-xs sm:text-sm text-gray-700">Strike Price</label>
                                </div>
                                <input
                                    type="text"
                                    name="strikePrice"
                                    value={inputs.strikePrice}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-900 border border-gray-200"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <label className="text-xs sm:text-sm text-gray-700">Current 409A Fair Market Value</label>
                                </div>
                                <input
                                    type="text"
                                    name="shareValue"
                                    value={inputs.shareValue}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-900 border border-gray-200"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <label className="text-xs sm:text-sm text-gray-700">Filing Status</label>
                                </div>
                                <div className="relative">
                                    <select
                                        name="filingStatus"
                                        value={inputs.filingStatus}
                                        onChange={handleInputChange}
                                        className="w-full p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-900 border border-gray-200 appearance-none"
                                    >
                                        <option value="Single">Single</option>
                                        <option value="Head of Household">Head of Household</option>
                                        <option value="Married Filing Jointly">Married Filing Jointly</option>
                                        <option value="Married Filing Separately">Married Filing Separately</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 sm:h-4 w-3 sm:w-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Column */}
                <div className="pt-4 lg:pt-16">
                    <h3 className="text-lg sm:text-xl mb-4 sm:mb-6 text-gray-900">
                        Here's an estimate of whether you'd owe AMT tax in {inputs.taxYear}, and if so, how much.
                    </h3>

                    <div className="space-y-3 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <span className="text-base sm:text-xl text-gray-900">Adjusted Gross Income</span>
                            <span className="text-base sm:text-xl text-gray-900">${results.income.toLocaleString()}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <span className="text-base sm:text-xl text-gray-900 italic">+ AMT Income Adjustment from Options Exercise</span>
                            <span className="text-base sm:text-xl text-gray-900">${results.adjustment.toLocaleString()}</span>
                        </div>

                        <div className="border-t border-gray-200 pt-3 sm:pt-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <span className="text-base sm:text-xl text-gray-900">AMT Income</span>
                                <span className="text-base sm:text-xl text-gray-900">${results.amtIncome.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-base sm:text-xl text-gray-900 italic">− AMT Exemption ({inputs.filingStatus})</span>
                                    <div
                                        className="relative"
                                        onMouseEnter={() => setShowExemptionTooltip(true)}
                                        onMouseLeave={() => setShowExemptionTooltip(false)}
                                    >
                                        <HelpCircle className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                                        {showExemptionTooltip && (
                                            <div className="absolute left-0 bottom-full mb-2 w-64 sm:w-80 p-3 bg-gray-800 text-white text-xs sm:text-sm rounded shadow-lg z-10">
                                                <div className="space-y-2">
                                                    <div>
                                                        <strong>{inputs.taxYear} AMT Exemption Amounts</strong>
                                                        <ul className="mt-1 space-y-1">
                                                            <li>Single or head of household: ${AMT_EXEMPTIONS[inputs.taxYear]['Single'].toLocaleString()}</li>
                                                            <li>Married, filing separately: ${AMT_EXEMPTIONS[inputs.taxYear]['Married Filing Separately'].toLocaleString()}</li>
                                                            <li>Married, filing jointly: ${AMT_EXEMPTIONS[inputs.taxYear]['Married Filing Jointly'].toLocaleString()}</li>
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <strong>{inputs.taxYear} AMT Exemption Phase-out Threshold</strong>
                                                        <ul className="mt-1 space-y-1">
                                                            <li>Single or head of household: ${AMT_PHASEOUT_THRESHOLDS[inputs.taxYear]['Single'].toLocaleString()}</li>
                                                            <li>Married, filing separately: ${AMT_PHASEOUT_THRESHOLDS[inputs.taxYear]['Married Filing Separately'].toLocaleString()}</li>
                                                            <li>Married, filing jointly: ${AMT_PHASEOUT_THRESHOLDS[inputs.taxYear]['Married Filing Jointly'].toLocaleString()}</li>
                                                        </ul>
                                                    </div>
                                                    <div className="text-xs text-gray-300">
                                                        Above the phase-out threshold, the exemption amount is reduced by 25 cents for each dollar of AMT income.
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <span className="text-base sm:text-xl text-gray-900">${results.amtExemption.toLocaleString()}</span>
                        </div>

                        <div className="border-t border-gray-200 pt-3 sm:pt-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <span className="text-base sm:text-xl text-gray-900">AMT Base</span>
                                <span className="text-base sm:text-xl text-gray-900">${results.amtBase.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-base sm:text-xl text-gray-900">Alternative Minimum Tax</span>
                                    <div
                                        className="relative"
                                        onMouseEnter={() => setShowTaxRateTooltip(true)}
                                        onMouseLeave={() => setShowTaxRateTooltip(false)}
                                    >
                                        <HelpCircle className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                                        {showTaxRateTooltip && (
                                            <div className="absolute left-0 bottom-full mb-2 w-64 sm:w-80 p-3 bg-gray-800 text-white text-xs sm:text-sm rounded shadow-lg z-10">
                                                <strong>{inputs.taxYear} {inputs.taxYear === '2024' ? '26%' : '26%'} AMT Tax Rate Income Threshold</strong>
                                                <ul className="mt-2 space-y-1">
                                                    <li>Single or head of household: ${AMT_RATE_THRESHOLDS[inputs.taxYear]['Single'].toLocaleString()}</li>
                                                    <li>Married, filing separately: ${AMT_RATE_THRESHOLDS[inputs.taxYear]['Married Filing Separately'].toLocaleString()}</li>
                                                    <li>Married, filing jointly: ${AMT_RATE_THRESHOLDS[inputs.taxYear]['Married Filing Jointly'].toLocaleString()}</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500">(26% or 28% of AMT base)</div>
                            </div>
                            <span className="text-base sm:text-xl text-gray-900">${results.tentativeMinTax.toLocaleString()}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-base sm:text-xl text-gray-900 italic">Federal Ordinary Income Tax</span>
                                    <div
                                        className="relative"
                                        onMouseEnter={() => setShowTaxCalcTooltip(true)}
                                        onMouseLeave={() => setShowTaxCalcTooltip(false)}
                                    >
                                        <HelpCircle className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                                        {showTaxCalcTooltip && (
                                            <div className="absolute left-0 bottom-full mb-2 w-80 p-3 bg-gray-800 text-white text-xs sm:text-sm rounded shadow-lg z-10">
                                                <div className="space-y-2">
                                                    <div>
                                                        <strong>Tax Calculation Breakdown</strong>
                                                        <div>Standard Deduction: ${STANDARD_DEDUCTIONS[inputs.taxYear][inputs.filingStatus].toLocaleString()}</div>
                                                        <div>Taxable Income: ${(results.income - STANDARD_DEDUCTIONS[inputs.taxYear][inputs.filingStatus]).toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        {TAX_BRACKETS[inputs.taxYear][inputs.filingStatus].map((bracket, index) => {
                                                            const nextBracket = TAX_BRACKETS[inputs.taxYear][inputs.filingStatus][index + 1];
                                                            const income = results.income - STANDARD_DEDUCTIONS[inputs.taxYear][inputs.filingStatus];
                                                            const bracketStart = bracket.threshold;
                                                            const bracketEnd = nextBracket ? nextBracket.threshold : Infinity;
                                                            const incomeInBracket = Math.min(
                                                                Math.max(0, income - bracketStart),
                                                                bracketEnd - bracketStart
                                                            );
                                                            if (incomeInBracket > 0) {
                                                                return (
                                                                    <div key={index}>
                                                                        {bracket.rate * 100}% bracket (${bracket.threshold.toLocaleString()} to {nextBracket ? '$' + nextBracket.threshold.toLocaleString() : '∞'}):
                                                                        <div className="text-gray-300">Tax in bracket: ${Math.round(incomeInBracket * bracket.rate).toLocaleString()}</div>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <span className="text-base sm:text-xl text-gray-900">${results.ordinaryIncomeTax.toLocaleString()}</span>
                        </div>

                        <div className="border-t border-gray-200 pt-3 sm:pt-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <span className="text-base sm:text-xl font-medium text-red-500">Payable Tax</span>
                                    <div className="text-xs sm:text-sm text-gray-500">(Greater of tentative minimum tax or ordinary income tax)</div>
                                </div>
                                <span className="text-base sm:text-xl font-medium text-red-500">${results.payableTax.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
