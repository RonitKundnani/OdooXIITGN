export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold
              ${index < currentStep ? 'bg-green-500 text-white' : 
                index === currentStep ? 'bg-[#F2BED1] text-white' : 
                'bg-gray-200 text-gray-500'}
            `}>
              {index < currentStep ? <CheckIcon /> : index + 1}
            </div>
            <span className={`mt-2 text-sm ${index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-1 flex-1 mx-2 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
