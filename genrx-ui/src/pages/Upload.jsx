import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Upload() { // Component name kept as Upload for route compatibility, but logic changes
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Static Data Dictionary
  const categories = [
    { id: 'pain', name: t('catPain'), icon: '💊', color: '#10b981', gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', shadow: 'rgba(16, 185, 129, 0.2)' },
    { id: 'cold', name: t('catCold'), icon: '🌡️', color: '#0ea5e9', gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', shadow: 'rgba(14, 165, 233, 0.2)' },
    { id: 'diabetes', name: t('catDiabetes'), icon: '🩸', color: '#f59e0b', gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', shadow: 'rgba(245, 158, 11, 0.2)' },
    { id: 'bp', name: t('catBP'), icon: '💓', color: '#ef4444', gradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', shadow: 'rgba(239, 68, 68, 0.2)' },
    { id: 'gastric', name: t('catGastric'), icon: '🤢', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', shadow: 'rgba(139, 92, 246, 0.2)' },
    { id: 'infection', name: t('catInfection'), icon: '🦠', color: '#6366f1', gradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', shadow: 'rgba(99, 102, 241, 0.2)' }
  ];

  const medicines = {
    pain: [
      { brand: 'Crocin 650', generic: 'Paracetamol 650mg', brandPrice: '₹30.00', genericPrice: '₹12.00', savings: '60%' },
      { brand: 'Combiflam', generic: 'Ibuprofen + Paracetamol', brandPrice: '₹45.00', genericPrice: '₹18.00', savings: '60%' },
      { brand: 'Volini Gel', generic: 'Diclofenac Gel', brandPrice: '₹140.00', genericPrice: '₹55.00', savings: '61%' },
      { brand: 'Dolo 650', generic: 'Paracetamol 650mg', brandPrice: '₹32.00', genericPrice: '₹12.00', savings: '62%' },
      { brand: 'Meftal Spas', generic: 'Mefenamic Acid', brandPrice: '₹50.00', genericPrice: '₹22.00', savings: '56%' }
    ],
    cold: [
      { brand: 'Vicks Action 500', generic: 'Paracetamol + Phenylephrine', brandPrice: '₹60.00', genericPrice: '₹25.00', savings: '58%' },
      { brand: 'D’Cold Total', generic: 'Cetirizine + Ambroxol', brandPrice: '₹55.00', genericPrice: '₹20.00', savings: '63%' },
      { brand: 'Otrivin Nasal', generic: 'Xylometazoline', brandPrice: '₹95.00', genericPrice: '₹40.00', savings: '58%' },
      { brand: 'Allegra 120', generic: 'Fexofenadine', brandPrice: '₹210.00', genericPrice: '₹75.00', savings: '64%' },
      { brand: 'Chetston Cold', generic: 'Cetirizine + Paracetamol', brandPrice: '₹45.00', genericPrice: '₹15.00', savings: '66%' }
    ],
    diabetes: [
      { brand: 'Glycomet 500', generic: 'Metformin 500mg', brandPrice: '₹25.00', genericPrice: '₹8.00', savings: '68%' },
      { brand: 'Januvia 100', generic: 'Sitagliptin 100mg', brandPrice: '₹400.00', genericPrice: '₹120.00', savings: '70%' },
      { brand: 'Galvus Met', generic: 'Vildagliptin + Metformin', brandPrice: '₹350.00', genericPrice: '₹110.00', savings: '68%' },
      { brand: 'Teneligliptin', generic: 'Teneligliptin 20mg', brandPrice: '₹140.00', genericPrice: '₹45.00', savings: '67%' },
      { brand: 'Glimepiride', generic: 'Glimepiride 1mg', brandPrice: '₹50.00', genericPrice: '₹12.00', savings: '76%' }
    ],
    bp: [
      { brand: 'Telma 40', generic: 'Telmisartan 40mg', brandPrice: '₹120.00', genericPrice: '₹30.00', savings: '75%' },
      { brand: 'Amlong 5', generic: 'Amlodipine 5mg', brandPrice: '₹60.00', genericPrice: '₹10.00', savings: '83%' },
      { brand: 'Losar 50', generic: 'Losartan 50mg', brandPrice: '₹90.00', genericPrice: '₹25.00', savings: '72%' },
      { brand: 'Concor 5', generic: 'Bisoprolol 5mg', brandPrice: '₹130.00', genericPrice: '₹45.00', savings: '65%' },
      { brand: 'Ramipril 5', generic: 'Ramipril 5mg', brandPrice: '₹85.00', genericPrice: '₹20.00', savings: '76%' }
    ],
    gastric: [
      { brand: 'Pan 40', generic: 'Pantoprazole 40mg', brandPrice: '₹155.00', genericPrice: '₹40.00', savings: '74%' },
      { brand: 'Omez 20', generic: 'Omeprazole 20mg', brandPrice: '₹60.00', genericPrice: '₹18.00', savings: '70%' },
      { brand: 'Gelusil Liquid', generic: 'Antacid Syrup', brandPrice: '₹130.00', genericPrice: '₹65.00', savings: '50%' },
      { brand: 'Rantac 150', generic: 'Ranitidine 150mg', brandPrice: '₹40.00', genericPrice: '₹15.00', savings: '62%' },
      { brand: 'Eno', generic: 'Sodium Bicarbonate', brandPrice: '₹30.00', genericPrice: '₹10.00', savings: '66%' }
    ],
    infection: [
      { brand: 'Augmentin 625', generic: 'Amoxicillin + Clavulanic', brandPrice: '₹220.00', genericPrice: '₹90.00', savings: '59%' },
      { brand: 'Azithral 500', generic: 'Azithromycin 500mg', brandPrice: '₹120.00', genericPrice: '₹45.00', savings: '62%' },
      { brand: 'Taxim O 200', generic: 'Cefixime 200mg', brandPrice: '₹110.00', genericPrice: '₹50.00', savings: '54%' },
      { brand: 'Ciplox 500', generic: 'Ciprofloxacin 500mg', brandPrice: '₹60.00', genericPrice: '₹25.00', savings: '58%' },
      { brand: 'Sporidex 500', generic: 'Cephalexin 500mg', brandPrice: '₹150.00', genericPrice: '₹60.00', savings: '60%' }
    ]
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', minHeight: '80vh' }}>
      <div className="text-center" style={{ marginBottom: '4rem' }}>
        <h1 className="mb-2" style={{ fontSize: '3rem' }}>
          <span className="text-gradient">{t('healthIssues')}</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '1.25rem' }}>
          {t('healthIssuesDesc')}
        </p>
      </div>

      {!selectedCategory ? (
        // Category Selection Grid
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          {categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="card animate-slide-up"
              style={{ 
                cursor: 'pointer',
                borderLeft: `6px solid ${cat.color}`,
                display: 'flex',
                alignItems: 'center',
                padding: '2rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 20px 25px -5px ${cat.shadow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
            >
              <div 
                style={{ 
                  background: cat.gradient,
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1.5rem',
                  fontSize: '2rem'
                }}
              >
                {cat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>{cat.name}</h3>
                <p className="text-muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.95rem' }}>{t('viewPopular')}</p>
              </div>
              <div 
                style={{
                  background: '#f1f5f9',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8'
                }}
              >
                ➝
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Detail View
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button 
            onClick={() => setSelectedCategory(null)}
            className="btn btn-outline mb-4"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '30px' }}
          >
            {t('backToCategories')}
          </button>

          <h2 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#334155' }}>
            <span style={{ fontSize: '2rem' }}>{categories.find(c => c.id === selectedCategory)?.icon}</span>
            {categories.find(c => c.id === selectedCategory)?.name} Medicines
          </h2>

          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '1.5rem', textAlign: 'left', color: '#64748b' }}>{t('brandName')}</th>
                    <th style={{ padding: '1.5rem', textAlign: 'left', color: '#64748b' }}>{t('genericName')}</th>
                    <th style={{ padding: '1.5rem', textAlign: 'right', color: '#64748b' }}>{t('brandPrice')}</th>
                    <th style={{ padding: '1.5rem', textAlign: 'right', color: '#10b981' }}>{t('genericPrice')}</th>
                    <th style={{ padding: '1.5rem', textAlign: 'center', color: '#f59e0b' }}>{t('savings')}</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines[selectedCategory]?.map((med, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1.5rem', fontWeight: 600, color: '#334155' }}>{med.brand}</td>
                      <td style={{ padding: '1.5rem', color: '#64748b' }}>{med.generic}</td>
                      <td style={{ padding: '1.5rem', textAlign: 'right', color: '#ef4444', textDecoration: 'line-through' }}>{med.brandPrice}</td>
                      <td style={{ padding: '1.5rem', textAlign: 'right', fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>{med.genericPrice}</td>
                      <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <span style={{ background: '#fffbeb', color: '#d97706', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                          {med.savings} {t('off')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
