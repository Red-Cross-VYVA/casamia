import { useTranslation } from 'react-i18next'

import { Plans } from '../components/Plans'

export function PlansPage() {
  const { t } = useTranslation()
  const headers = t('pages.plans.headers', { returnObjects: true }) as string[]
  const rows = t('pages.plans.rows', { returnObjects: true }) as string[][]

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-inner">
          <h1 className="display-title">{t('pages.plans.title')}</h1>
          <p className="mt-5 max-w-3xl text-xl text-text-mid">{t('pages.plans.intro')}</p>
        </div>
      </section>

      <Plans standalone />

      <section className="section-pad bg-light-blue">
        <div className="site-shell">
          <h2 className="display-title">{t('pages.plans.comparisonTitle')}</h2>
          <div className="mt-8 overflow-x-auto rounded-lg border border-border bg-white shadow-soft">
            <table className="comparison-table w-full border-collapse text-left">
              <thead className="bg-navy text-white">
                <tr>
                  {headers.map((header) => (
                    <th className="px-5 py-4 text-sm font-extrabold uppercase" key={header}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr className="border-t border-border" key={`${row[0]}-${rowIndex}`}>
                    {row.map((cell, index) => (
                      <td
                        className={`px-5 py-4 ${
                          index === 0 ? 'font-bold text-text-dark' : 'text-text-mid'
                        }`}
                        key={`${rowIndex}-${index}-${cell}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
