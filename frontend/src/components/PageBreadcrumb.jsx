import React from "react";
import { Link } from "react-router-dom";

const PageBreadcrumb = ({ items = [], currentStep = 0, bottom = false }) => {
  return (
    <div className={`w-full ${bottom ? "mt-6 mb-4" : ""}`}>
      <div className="w-full px-6 md:px-10 py-4">
        <div className="flex flex-wrap items-center justify-center gap-y-3">
          {items.map((item, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;
            const isClickable = index <= currentStep;

            const stepContent = (
              <div
                className={`inline-flex items-center rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                  isCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : isCurrent
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <span className="mr-2">
                  {isCompleted ? "✓" : index + 1}
                </span>
                <span>{item.label}</span>
              </div>
            );

            return (
              <React.Fragment key={`${item.label}-${index}`}>
                {isClickable && !isCurrent ? (
                  <Link to={item.path} className="no-underline">
                    {stepContent}
                  </Link>
                ) : (
                  stepContent
                )}

                {index < items.length - 1 && (
                  <div
                    className={`mx-2 md:mx-4 h-[3px] w-8 md:w-12 rounded-full ${
                      index < currentStep ? "bg-emerald-300" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PageBreadcrumb;