import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const IMPORT_GUIDES = [
  {
    name: 'Strava',
    icon: '🟠',
    formats: ['GPX'],
    steps: [
      'Open any activity in Strava (web or app)',
      'Click the "..." menu or Settings icon',
      'Select "Export GPX" or "Download GPX"',
      'Upload the downloaded .gpx file here'
    ],
    link: 'https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export'
  },
  {
    name: 'Garmin Connect',
    icon: '🔵',
    formats: ['GPX', 'TCX', 'FIT'],
    steps: [
      'Log into Garmin Connect on the web',
      'Go to Activities and open any activity',
      'Click the gear icon → "Export Original" or "Export to GPX"',
      'Upload the downloaded file here'
    ],
    link: 'https://support.garmin.com/en-US/?faq=W1TvTPW8JZ6LfJSfK512Q8'
  },
  {
    name: 'Apple Watch / Fitness',
    icon: '🍎',
    formats: ['GPX (via third-party)'],
    steps: [
      'Use the HealthFit, RunGap, or similar app to export workouts',
      'Select the workout and export as GPX',
      'Share/Save the GPX file',
      'Upload the file here'
    ],
    link: 'https://apps.apple.com/app/healthfit/id1202650514'
  },
  {
    name: 'Fitbit',
    icon: '💚',
    formats: ['TCX'],
    steps: [
      'Log into fitbit.com on a computer',
      'Go to Log → Activities',
      'Click on the workout and find "Export to TCX"',
      '(Note: GPS data export may require Fitbit Premium)'
    ],
    link: 'https://help.fitbit.com/articles/en_US/Help_article/1133.htm'
  },
  {
    name: 'Nike Run Club',
    icon: '✓',
    formats: ['GPX (via third-party)'],
    steps: [
      'Nike doesn\'t allow direct export',
      'Use a service like SyncMyTracks or RunGap',
      'Connect your Nike account and export workouts',
      'Upload the exported GPX file here'
    ],
    link: null
  },
  {
    name: 'Any App (CSV)',
    icon: '📊',
    formats: ['CSV'],
    steps: [
      'Most fitness apps allow CSV export in settings',
      'Export your workouts as CSV with columns:',
      'date, duration, type, distance, avg_heart_rate',
      'Upload the CSV file here'
    ],
    link: null
  }
];

export default function DataImportHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState(null);
  
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-500 transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
        How to export from other apps?
      </button>
      
      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-dark-300 rounded-2xl w-full max-w-lg border border-white/10 max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Import Workouts</h2>
                    <p className="text-xs sm:text-sm text-gray-400">Export from your favorite apps</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Info */}
              <div className="px-6 py-4 bg-primary-500/10 border-b border-white/5">
                <p className="text-sm text-gray-300">
                  <strong className="text-primary-500">Supported formats:</strong> GPX, CSV
                  <br />
                  <span className="text-gray-400">Export from any fitness app and upload here to import your workout history.</span>
                </p>
              </div>
              
              {/* Guides List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {IMPORT_GUIDES.map((guide, index) => (
                  <motion.div
                    key={guide.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-white/10 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedGuide(expandedGuide === index ? null : index)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{guide.icon}</span>
                        <div className="text-left">
                          <span className="font-medium text-white">{guide.name}</span>
                          <span className="ml-2 text-xs text-gray-500">
                            {guide.formats.join(', ')}
                          </span>
                        </div>
                      </div>
                      {expandedGuide === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedGuide === index && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 space-y-3">
                            <ol className="space-y-2">
                              {guide.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-dark-200 flex items-center justify-center text-xs text-gray-400">
                                    {i + 1}
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                            
                            {guide.link && (
                              <a
                                href={guide.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary-500 hover:text-primary-400"
                              >
                                Official guide <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-dark-200 hover:bg-dark-100 text-white rounded-xl transition-colors"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
