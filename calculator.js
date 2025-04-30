document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll(
    "#purchasePrice,#propertyAddress, #renoCosts, #holdingCosts,#closingCosts, #afterRepairValue,#projectMonths,#resaleCosts,#downPaymentPercent,#gapCosts,#loanPoints,#houseLoanYear,#houseinterestRate,#houseMonthlyRent,#insurance,#propertyTaxesHF,#downPaymentType,#houseAnnualMaintenance,#houseAnnualUtilities"
  );
  const input2 = document.querySelectorAll(
    "#currentAge, #retirementAge, #currentSavings,#lifeInsuranceMonthlyContributions,#wholeLifeInsurance, #monthlyContributions, #annualReturn,#desiredIncome,#inflationRate,#currentRealEstateEquity,#currentStockValue,#realEstateAppreciation,#mortgageBalance , #mortgageInterestRate , #mortgageTerm"
  );
  const input3 = document.querySelectorAll(
    "#managementFees, #maintenanceCosts, #insuranceCosts,#renovations,#utilities,#rentGrowth,#closingCostsRent, #propertyTaxes, #vacancyRate,#monthlyRent,#interestRate,#loanTerm,#downPayment,#propertyPrice,#timeDuration , #appreciationRate "
  );

  inputs.forEach((input) => {
    input.addEventListener("input", calculateHouseFlip);
  });
  input2.forEach((input) => {
    input.addEventListener("input", calculateRetirement);
  });
  input3.forEach((input) => {
    input.addEventListener("input", calculateRentalProperty);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  calculateHouseFlip();
  calculateRetirement();
  calculateRentalProperty();
});


function formatNumber(value) {
  let formattedValue =
    value % 1 === 0
      ? Math.abs(value).toLocaleString()
      : Math.abs(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

  return value < 0 ? `- $${formattedValue}` : `$${formattedValue}`;
}
function formatNumberPercent(value) {
  return value % 1 === 0
    ? value.toLocaleString()
    : value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
}

function calculateHouseFlip() {
  // Get input values
  let purchase = parseFloat(document.getElementById("purchasePrice").value) || 0;
  let reno = parseFloat(document.getElementById("renoCosts").value) || 0;
  let holding = parseFloat(document.getElementById("holdingCosts").value) || 0;
  let arv = parseFloat(document.getElementById("afterRepairValue").value) || 0;
  let desiredProfitMargin = parseFloat(document.getElementById("desiredProfitMargin").value) || 0;
  
  // Loan & Gap Fields
  let interestRate = parseFloat(document.getElementById("houseinterestRate").value) || 0;
  let loanPoints = parseFloat(document.getElementById("loanPoints").value) || 0;
  let termYears = parseFloat(document.getElementById("houseLoanYear").value) || 0;
  let totalPayments = termYears * 12;
  let gapFundingRate = parseFloat(document.getElementById("gapCosts").value) || 0;
  
  // Additional Fields
  let downPaymentPercent = parseFloat(document.getElementById("downPaymentPercent").value) || 0;
  let resaleCostPercent = parseFloat(document.getElementById("resaleCosts").value) || 0;
  let resaleCosts = (arv * resaleCostPercent) / 100;
  let address = document.getElementById("propertyAddress").value;
  let months = parseFloat(document.getElementById("projectMonths").value) || 0;
  let monthlyRent = parseFloat(document.getElementById("houseMonthlyRent").value) || 0;
  let annualPropertyTaxes = parseFloat(document.getElementById("propertyTaxesHF").value) || 0;
  let annualInsurance = parseFloat(document.getElementById("insurance").value) || 0;
  let annualMaintenance = parseFloat(document.getElementById("houseAnnualMaintenance").value) || 0;
  let annualUtilities = parseFloat(document.getElementById("houseAnnualUtilities").value) || 0;
  
  document.querySelector(".housecharts").style.display = "block";

  // Determine down payment type and base
  let downPaymentType = document.getElementById("downPaymentType").value;
  let downPaymentBase = downPaymentType === "purchaseAndReno" ? (purchase + reno) : purchase;

  // Calculate closing costs and down payment
  let closingPercent = parseFloat(document.getElementById("closingCosts").value) || 0;
  let closing = (downPaymentBase * closingPercent) / 100;
  let downPayment = (downPaymentBase * downPaymentPercent) / 100;
  
  // Calculate loan details
  let monthlyRate = (interestRate / 100) / 12;
  let loanAmount = downPaymentType === "purchaseAndReno" ? (purchase + reno) - downPayment : purchase - downPayment;
  
  // Calculate prorated expenses
  let proratedMaintenance = (annualMaintenance / 12) * months;
  let proratedUtilities = (annualUtilities / 12) * months;
  let proratedTaxes = (annualPropertyTaxes / 12) * months;
  let proratedInsurance = (annualInsurance / 12) * months;
  
  // Calculate mortgage payments and interest
  let monthlyMortgagePayment = termYears > 0
    ? (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments))
    : 0;
  
  // Calculate total interest paid over the project duration
  let totalMortgagePaid = monthlyMortgagePayment * months;
  let totalInterestPaid = 0;
  
  if (termYears > 0) {
    let remainingBalance = loanAmount;
    for (let i = 0; i < months; i++) {
      let interestPayment = remainingBalance * monthlyRate;
      let principalPayment = monthlyMortgagePayment - interestPayment;
      totalInterestPaid += interestPayment;
      remainingBalance -= principalPayment;
    }
  }
  
  let loanFees = (loanAmount * loanPoints) / 100;
  
  // Calculate total project costs
  let totalProjectCost = purchase + reno + holding + closing + resaleCosts + totalInterestPaid + loanFees + proratedTaxes + proratedInsurance;
  
  // Calculate gap costs
  let gapCosts = totalProjectCost - (loanAmount + downPayment);
  let gapFundingFees = gapCosts > 0 ? (gapCosts * gapFundingRate) / 100 : 0;
  
  // Calculate total investment
  let totalInvestment = purchase + reno + holding + totalInterestPaid + loanFees + gapFundingFees + proratedTaxes + proratedInsurance;
  
  // Calculate total cash invested
  let totalCashInvested = downPayment + closing + (downPaymentType === "purchaseAndReno" ? 0 : reno) + holding + resaleCosts + proratedTaxes + proratedInsurance;
  
  // Calculate profits
  let grossProfit = arv - purchase;
  let netProfit = arv - totalInvestment;

  // Calculate returns
  let profitMargin = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  let cashOnCashReturn = totalCashInvested > 0 ? (netProfit / totalCashInvested) * 100 : 0;

  // Calculate break-even analysis
  let monthlyRentalProfit = ((arv * 0.01) - (holding / months)).toFixed(2);
  let breakEvenYears = monthlyRentalProfit > 0 ? (netProfit / (monthlyRentalProfit * 12)).toFixed(2) : "N/A";
  
  // Calculate total holding expenses
  let totalHoldingExpenses = holding + proratedTaxes + proratedInsurance + proratedMaintenance + proratedUtilities + totalInterestPaid + loanFees + gapFundingFees;
  let monthlyHoldingCost = months > 0 ? (totalHoldingExpenses / months).toFixed(2) : 0;

  // Calculate rental vs flip analysis
  let rentalVsFlip = (netProfit > 0 && monthlyRent > 0) ? (netProfit / (monthlyRent * 12)).toFixed(2) : "N/A";
  
  // Calculate deal status
  let deal = (profitMargin >= desiredProfitMargin && netProfit > 0) ? "YES" : "NO";
  
  // Calculate maximum purchase price
  let allOtherCosts = reno + holding + closing + resaleCosts + totalInterestPaid + loanFees + gapFundingFees + proratedTaxes + proratedInsurance;
  let maxPurchasePrice = (arv - allOtherCosts) / (1 + (desiredProfitMargin / 100));

  // Display results
  document.getElementById("totalInvestment").innerText = formatNumber(totalInvestment);
  document.getElementById("netProfit").innerText = formatNumber(netProfit);
  document.getElementById("totalCashInvested").innerText = formatNumber(totalCashInvested);
  document.getElementById("profitMargin").innerText = formatNumberPercent(profitMargin) + "%";
  document.getElementById("cashOnCashReturn").innerText = formatNumberPercent(cashOnCashReturn) + "%";
  document.getElementById("breakEvenYears").innerText = breakEvenYears;
  document.getElementById("rentalVsFlip").innerText = rentalVsFlip !== "N/A" ? `${rentalVsFlip} years to match flip profit with rental income.` : "N/A";
  document.getElementById("dealStatus").innerText = deal;
  document.getElementById("monthlyHoldingCost").innerText = `${formatNumber(monthlyHoldingCost)}`;
  document.getElementById("displayedAddress").innerText = address ? `📍 ${address}` : '';
    document.getElementById("calculatedGapCost").innerText = formatNumber(gapFundingFees);
  document.getElementById("maxPurchasePrice").innerText = formatNumber(maxPurchasePrice);

  // Update card colors based on results
  let netProfitEl = document.getElementById("netProfit");
  let netprocard = document.querySelector(".netprocard");
  let netprocardhead = document.querySelector(".netprocardhead");
  netProfitEl.style.color = netProfit > 0 ? "black" : "black";
  netprocardhead.style.color = netProfit > 0 ? "black" : "#d0b870";
  netprocard.style.background = netProfit > 0 ? "#d0b870" : "#f86d6d";

  let profitMarginEl = document.getElementById("profitMargin");
  let promarcard = document.querySelector(".promarcard");
  let promarcardhead = document.querySelector(".promarcardhead");
  profitMarginEl.style.color = profitMargin >= desiredProfitMargin ? "black" : "black";
  promarcardhead.style.color = profitMargin >= desiredProfitMargin ? "black" : "#d0b870";
  promarcard.style.background = profitMargin >= desiredProfitMargin ? "#d0b870" : "#f86d6d";

  // Reset and update charts
  resetCanvas("projectCostBreakdownChart");
  resetCanvas("arvDistributionChart");

  createProjectCostBreakdownChart({
    purchase,
    reno,
    holding,
    loanInterest: totalInterestPaid,
    loanFees,
    resaleCosts,
    closing,
    proratedTaxes,
    proratedInsurance
  });
  
  createARVDistributionChart({
    investment: totalInvestment,
    resaleCosts,
    netProfit
  });
}

function resetCanvas(id) {
  let canvasWrapper = document.getElementById(id).parentNode;
  canvasWrapper.innerHTML = `<canvas id="${id}"></canvas>`;
}

Chart.register(ChartDataLabels);

function createProjectCostBreakdownChart(data) {
  const ctx = document.getElementById("projectCostBreakdownChart").getContext("2d");

  // Combine holding-related costs into one
  const combinedHolding = data.holding + data.loanInterest + data.proratedTaxes + data.proratedInsurance;

  const labels = [
    "Purchase",
    "Renovation",
    "Holding (incl. interest, taxes, insurance)",
    "Loan Fees",
    "Resale Costs",
    "Closing Costs"
  ];

  const values = [
    data.purchase,
    data.reno,
    combinedHolding,
    data.loanFees,
    data.resaleCosts,
    data.closing
  ];

  const total = values.reduce((a, b) => a + b, 0);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          "#F39655", "#B77CE9", "#55CBE5", "#e74c3c",
          "#1abc9c", "#e67e22"
        ],
        borderColor: "#ffffff",
        borderWidth: 4,
        hoverOffset: 20,
      }]
    },
    options: {
      responsive: true,
      cutout: '0%',
      plugins: {
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: (value, context) => {
            const percentage = (value / total) * 100;
            return `${percentage.toFixed(1)}%`;
          },
          display: function (context) {
            const value = context.dataset.data[context.dataIndex];
            const percentage = (value / total) * 100;
            return percentage >= 5;
          }
        },
        title: {
          display: true,
          text: 'Project Cost Breakdown',
          font: {
            size: 20,
            weight: 'bold',
            color: '#000000'
          }
        },
        legend: {
          position: 'right',
          labels: {
            boxWidth: 14,
            padding: 16,
            font: {
              size: 14,
              color: '#000000'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const value = ctx.parsed;
              const percentage = ((value / total) * 100).toFixed(2);
              return `${ctx.label}: $${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function createARVDistributionChart(data) {
  const ctx = document.getElementById("arvDistributionChart").getContext("2d");

  const labels = ["Total Investment", "Resale Costs", "Net Profit"];
  const values = [data.investment, data.resaleCosts, data.netProfit];
  const total = values.reduce((a, b) => a + b, 0);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ["#2980b9", "#f1c40f", "#2ecc71"],
        borderColor: "#ffffff",
        borderWidth: 4,
        hoverOffset: 20
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'ARV Distribution',
          font: {
            size: 20,
            weight: 'bold'
          },
          color: '#000000'
        },
        legend: {
          position: 'right',
          labels: {
            boxWidth: 14,
            padding: 16,
            font: {
              size: 14,
              color: '#000000'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const value = ctx.parsed;
              const percentage = ((value / total) * 100).toFixed(2);
              return `${ctx.label}: $${value.toLocaleString()} (${percentage}%)`;
            }
          }
        },
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: (value, context) => {
            const percentage = (value / total) * 100;
            return `${percentage.toFixed(1)}%`;
          },
          display: function (context) {
            const value = context.dataset.data[context.dataIndex];
            const percentage = (value / total) * 100;
            return percentage >= 5; // Show only if the slice is 5% or more
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

// Move all event listeners and initialization inside DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
  // Initialize event listeners for all inputs
  const inputs = document.querySelectorAll(
    "#currentAge, #retirementAge, #currentSavings, #monthlyContributions, #annualReturn, #inflationRate, #desiredIncome, #currentRealEstateEquity, #realEstateAppreciation, #mortgageBalance, #mortgageInterestRate, #mortgageTerm, #wholeLifeInsurance, #lifeInsuranceMonthlyContributions, #currentStockValue, #stockGrowthRate"
  );

  inputs.forEach(input => {
    input.addEventListener("input", calculateRetirement);
  });

  // Initial calculation
  calculateRetirement();
});

function calculateRetirement() {
  // Get input values with null checks
  let currentAge = parseInt(document.getElementById("currentAge")?.value) || 0;
  let retirementAge = parseInt(document.getElementById("retirementAge")?.value) || 0;
  let currentSavings = parseFloat(document.getElementById("currentSavings")?.value) || 0;
  let monthlyContributions = parseFloat(document.getElementById("monthlyContributions")?.value) || 0;
  let annualReturn = parseFloat(document.getElementById("annualReturn")?.value) || 0;
  let inflationRate = parseFloat(document.getElementById("inflationRate")?.value) || 0;
  let desiredIncome = parseFloat(document.getElementById("desiredIncome")?.value) || 0;
  let currentRealEstateEquity = parseFloat(document.getElementById("currentRealEstateEquity")?.value) || 0;
  let realEstateAppreciation = parseFloat(document.getElementById("realEstateAppreciation")?.value) || 0;
  let mortgageBalance = parseFloat(document.getElementById("mortgageBalance")?.value) || 0;
  let mortgageInterestRate = parseFloat(document.getElementById("mortgageInterestRate")?.value) || 0;
  let mortgageTerm = parseFloat(document.getElementById("mortgageTerm")?.value) || 0;
  let wholeLifeInsurance = parseFloat(document.getElementById("wholeLifeInsurance")?.value) || 0;
  let lifeInsuranceMonthlyContributions = parseFloat(document.getElementById("lifeInsuranceMonthlyContributions")?.value) || 0;
  let currentStockValue = parseFloat(document.getElementById("currentStockValue")?.value) || 0;
  let stockGrowthRate = parseFloat(document.getElementById("stockGrowthRate")?.value) || 3;

  // Validate inputs
  if (currentAge >= retirementAge) {
    alert("Retirement age must be greater than current age");
    return;
  }

  // Calculate years to retirement
  let yearsToRetirement = retirementAge - currentAge;
  let n = 12; // Monthly compounding
  let r = annualReturn / 100 / n; // Monthly return rate

  // Calculate future value of current savings
  let fvCurrentSavings = currentSavings * Math.pow(1 + annualReturn/100, yearsToRetirement);

  // Calculate future value of monthly contributions
  let fvContributions = monthlyContributions * ((Math.pow(1 + r, yearsToRetirement * n) - 1) / r) * (1 + r);

  // Calculate future value of stocks
  let fvStock = currentStockValue * Math.pow(1 + stockGrowthRate/100, yearsToRetirement);

  // Calculate future value of real estate
  let realEstateRate = realEstateAppreciation / 100;
  let fvRealEstate = currentRealEstateEquity * Math.pow(1 + realEstateRate, yearsToRetirement);

  // Calculate mortgage payoff
  let monthlyMortgageRate = mortgageInterestRate / 100 / 12;
  let totalMortgagePayments = mortgageTerm * 12;
  let monthlyMortgagePayment = mortgageBalance * (monthlyMortgageRate * Math.pow(1 + monthlyMortgageRate, totalMortgagePayments)) / (Math.pow(1 + monthlyMortgageRate, totalMortgagePayments) - 1);
  
  // Calculate remaining mortgage at retirement
  let remainingMortgage = 0;
  if (yearsToRetirement < mortgageTerm) {
    let monthsPaid = yearsToRetirement * 12;
    remainingMortgage = mortgageBalance * Math.pow(1 + monthlyMortgageRate, monthsPaid) - 
      (monthlyMortgagePayment * (Math.pow(1 + monthlyMortgageRate, monthsPaid) - 1) / monthlyMortgageRate);
  }

  // Adjust real estate value by remaining mortgage
  fvRealEstate -= remainingMortgage;

  // Calculate future value of life insurance
  let fvLifeInsuranceContributions = lifeInsuranceMonthlyContributions * ((Math.pow(1 + r, yearsToRetirement * n) - 1) / r) * (1 + r);
  let fvWholeLifeInsurance = wholeLifeInsurance + fvLifeInsuranceContributions;

  // Calculate total savings at retirement
  let totalSavings = fvCurrentSavings + fvContributions + fvStock + fvRealEstate + fvWholeLifeInsurance;

  // Calculate adjusted income with inflation
  let adjustedIncome = desiredIncome * Math.pow(1 + inflationRate/100, yearsToRetirement);

  // Calculate withdrawal simulation
  let withdrawalYears = 0;
  let remainingBalance = totalSavings;
  let yearlyWithdrawal = adjustedIncome;
  let yearsArray = [];
  let balanceArray = [];

  while (remainingBalance > 0 && withdrawalYears < 100) {
    yearsArray.push(withdrawalYears);
    balanceArray.push(remainingBalance);
    withdrawalYears++;
    remainingBalance -= yearlyWithdrawal;
    remainingBalance *= 1 + annualReturn/100;
    yearlyWithdrawal *= 1 + inflationRate/100;
  }

  // Calculate retirement years
  let expectedLifespan = 90;
  let retirementYears = expectedLifespan - retirementAge;
  let shortfallSurplus = withdrawalYears >= retirementYears 
    ? "Surplus (Funds last throughout retirement)"
    : `Funds won't last throughout retirement, short by ${retirementYears - withdrawalYears} years`;

  // Update UI
  document.getElementById("totalSavings").innerText = formatNumber(totalSavings);
  document.getElementById("annualWithdrawal").innerText = formatNumber(adjustedIncome);
  document.getElementById("yearsUntilDepletion").innerText = withdrawalYears;
  document.getElementById("shortfallSurplus").innerText = shortfallSurplus;

  // Update card colors
  let shortfallSurplusDiv = document.querySelector(".short");
  if (withdrawalYears >= retirementYears) {
    shortfallSurplusDiv.style.backgroundColor = "#d0b870";
    document.querySelector(".shortcap").style.color = "black";
  } else {
    shortfallSurplusDiv.style.backgroundColor = "#f86d6d";
    document.querySelector(".shortcap").style.color = "#d0b870";
  }

  // Generate projections
  let projections = [];
  let projectionYears = [5, 10, 15, 20, 25, 30].filter(y => y <= yearsToRetirement);
  
  for (let year of projectionYears) {
    let stockValue = currentStockValue * Math.pow(1 + stockGrowthRate/100, year);
    let realEstateValue = currentRealEstateEquity * Math.pow(1 + realEstateRate, year);
    
    // Calculate remaining mortgage for this year
    let remainingMortgage = 0;
    if (year < mortgageTerm) {
      let monthsPaid = year * 12;
      remainingMortgage = mortgageBalance * Math.pow(1 + monthlyMortgageRate, monthsPaid) - 
        (monthlyMortgagePayment * (Math.pow(1 + monthlyMortgageRate, monthsPaid) - 1) / monthlyMortgageRate);
    }
    realEstateValue -= remainingMortgage;

    let insuranceValue = wholeLifeInsurance + 
      (lifeInsuranceMonthlyContributions * ((Math.pow(1 + r, year * n) - 1) / r) * (1 + r));

    projections.push({
      year,
      stockValue,
      realEstateValue,
      insuranceValue,
      totalValue: stockValue + realEstateValue + insuranceValue
    });
  }

  // Display projections
  let projectionsDiv = document.getElementById("projections");
  projectionsDiv.innerHTML = `<h3 class="dynamicHead">Time-based Asset Projections:</h3>`;
  projections.forEach(proj => {
    projectionsDiv.innerHTML += `
      <p class="dynamicPara">In <strong>${proj.year} years:</strong></p>
      <ul>
        <li class="dynamicList">Stock Value: ${formatNumber(proj.stockValue)}</li>
        <li class="dynamicList">Real Estate Value: ${formatNumber(proj.realEstateValue)}</li>
        <li class="dynamicList">Life Insurance Value: ${formatNumber(proj.insuranceValue)}</li>
        <li class="dynamicList"><strong>Total Value: ${formatNumber(proj.totalValue)}</strong></li>
      </ul>`;
  });

  // Update charts
  if (fvStock > 0 || fvRealEstate > 0 || fvWholeLifeInsurance > 0 || fvContributions > 0) {
    renderAssetBreakdownChart(fvStock, fvRealEstate, fvWholeLifeInsurance, fvCurrentSavings + fvContributions);
    renderIncomeSourcePie(fvContributions, fvStock, fvRealEstate, fvWholeLifeInsurance);
  }
}

// charts
function renderAssetBreakdownChart(fvStock, fvRealEstate, fvWholeLifeInsurance, fvSavings) {
  const ctx = document.getElementById("assetBreakdownChart").getContext("2d");

  const total = fvStock + fvRealEstate + fvWholeLifeInsurance + fvSavings;

  const chartData = {
    labels: ["Stocks", "Real Estate", "Whole Life Insurance", "Savings"],
    datasets: [{
      label: "Asset Distribution at Retirement",
      data: [fvStock, fvRealEstate, fvWholeLifeInsurance, fvSavings],
      backgroundColor: ["#F39655", "#B77CE9 ", "#55CBE5 ", "#e67e22"],
      borderColor: "#ffffff",
      borderWidth: 4,
      hoverOffset: 20
    }]
  };

  // Destroy previous chart instance if it exists
  if (window.assetBreakdownChart instanceof Chart) {
    window.assetBreakdownChart.destroy();
  }

  window.assetBreakdownChart = new Chart(ctx, {
    type: "pie",
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Asset Allocation Breakdown at Retirement",
          font: {
            size: 20,
            weight: 'bold'
          },
          color: '#000000'
        },
        legend: {
          position: "right",
          labels: {
            boxWidth: 14,
            padding: 16,
            font: {
              size: 14,
              color: '#000000'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const value = ctx.parsed;
              const percentage = ((value / total) * 100).toFixed(2);
              return `${ctx.label}: $${value.toLocaleString()} (${percentage}%)`;
            }
          }
        },
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 14
          },
          formatter: (value, context) => {
            const percentage = (value / total) * 100;
            return `${percentage.toFixed(1)}%`;
          },
          display: function (context) {
            const value = context.dataset.data[context.dataIndex];
            const percentage = (value / total) * 100;
            return percentage >= 5; // Only show if 5% or more
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

let incomeSourceChartInstance;

function renderIncomeSourcePie(contributions, stock, realEstate, insurance) {
  const ctx = document.getElementById("incomeSourceChart").getContext("2d");

  const dataValues = [contributions, stock, realEstate, insurance];
  const total = dataValues.reduce((a, b) => a + b, 0);

  if (incomeSourceChartInstance) {
    incomeSourceChartInstance.destroy();
  }

  incomeSourceChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Contributions", "Stock", "Real Estate", "Whole Life Insurance"],
      datasets: [
        {
          label: "Income Source Contribution at Retirement",
          data: dataValues,
          backgroundColor: ["#55CBE5", "#e74c3c", "#F39655", "#B77CE9"],
          borderColor: "#ffffff",
          borderWidth: 4,
          hoverOffset: 20,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Income Sources at Retirement`,
          font: {
            size: 20,
            weight: 'bold'
          },
          color: '#000000'
        },
        legend: {
          position: "right",
          labels: {
            boxWidth: 14,
            padding: 16,
            font: {
              size: 14,
              color: '#000000'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const value = ctx.parsed;
              const percentage = ((value / total) * 100).toFixed(2);
              return `${ctx.label}: $${value.toLocaleString()} (${percentage}%)`;
            }
          }
        },
        datalabels: {
          color: "white",
          font: {
            weight: "bold",
            size: 14,
          },
          formatter: (value, ctx) => {
            const percentage = (value / total) * 100;
            return percentage >= 5 ? `${percentage.toFixed(1)}%` : "";
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1500,
        easing: "easeOutBounce"
      }
    },
    plugins: [ChartDataLabels]
  });
}

function calculateRentalProperty() {
  // Get values and convert to numbers
  let propertyPrice =
    parseFloat(document.getElementById("propertyPrice").value.trim()) || 0;
  let downPaymentPercent = parseFloat(document.getElementById("downPayment").value.trim()) || 0;
  let downPayment = (downPaymentPercent / 100) * propertyPrice;
  let loanTerm =
    parseFloat(document.getElementById("loanTerm").value.trim()) || 0;
  let interestRate =
    parseFloat(document.getElementById("interestRate").value.trim()) || 0;
  let monthlyRent =
    parseFloat(document.getElementById("monthlyRent").value.trim()) || 0;
  let vacancyRate =
    parseFloat(document.getElementById("vacancyRate").value.trim()) || 0;
  let propertyTaxes =
    parseFloat(document.getElementById("propertyTaxes").value.trim()) || 0;
  let insuranceCosts =
    parseFloat(document.getElementById("insuranceCosts").value.trim()) || 0;
  let maintenanceCosts =
    parseFloat(document.getElementById("maintenanceCosts").value.trim()) || 0;
  let managementFees =
    parseFloat(document.getElementById("managementFees").value.trim()) || 0;
  let utilities = parseFloat(document.getElementById("utilities").value.trim()) || 0;
  let renovations = parseFloat(document.getElementById("renovations").value.trim()) || 0;
  let rentGrowth = parseFloat(document.getElementById("rentGrowth").value.trim()) || 0;
  let closingCostsPercent = parseFloat(document.getElementById("closingCostsRent").value.trim()) || 0;
  let closingCosts = (closingCostsPercent / 100) * propertyPrice;
  // getting time value 
  let timeDuration = parseInt(document.getElementById("timeDuration").value.trim()) || 10;
  let appreciationRate = parseFloat(document.getElementById("appreciationRate").value.trim()) || 3;

  // Reference error span elements
  let errors = {
    propertyPrice: document.getElementById("errorPropertyPrice"),
    downPayment: document.getElementById("errorDownPaymentPer"),
    loanTerm: document.getElementById("errorLoanTerm"),
    interestRate: document.getElementById("errorInterestRate"),
    monthlyRent: document.getElementById("errorMonthlyRent"),
    vacancyRate: document.getElementById("errorVacancyRate"),
    propertyTaxes: document.getElementById("errorPropertyTaxes"),
    insuranceCosts: document.getElementById("errorInsuranceCosts"),
    maintenanceCosts: document.getElementById("errorMaintenanceCosts"),
    managementFees: document.getElementById("errorManagementFees"),
    utilities: document.getElementById("errorUtilities"),
    renovations: document.getElementById("errorRenovations"),
    rentGrowth: document.getElementById("errorRentGrowth"),
    closingCosts: document.getElementById("errorClosingCostsRent"),
  };
  document.querySelector(".rentalcharts").style.display = "block";
  // Clear previous error messages
  Object.values(errors).forEach((error) => (error.innerText = ""));

  let isValid = true;

  // 🚨 **Validations**
  function validateInput(value, errorField, fieldName, min = 0, max = Infinity) {
    if (fieldName == "Down Payment (%)" && (value < min || value > max)) {
      errorField.innerText = `${fieldName} must be less than 100 .`;
    }
    else if (fieldName == "Loan Term (Years)" && (value < min || value > max)) {
      errorField.innerText = `${fieldName} must be less than 30 .`;
    }
    else {
      if (value < min || value > max) {
        errorField.innerText = `${fieldName} must be greater than ${min} .`;
        isValid = false;
      }
    }
  }

  validateInput(propertyPrice, errors.propertyPrice, "Property Price", 1000);
  validateInput(downPaymentPercent, errors.downPayment, "Down Payment (%)", 0, 100);
  validateInput(loanTerm, errors.loanTerm, "Loan Term (Years)", 1, 30);
  validateInput(interestRate, errors.interestRate, "Interest Rate (%)", 0, 100);
  validateInput(monthlyRent, errors.monthlyRent, "Monthly Rent", 0);
  validateInput(vacancyRate, errors.vacancyRate, "Vacancy Rate (%)", 0, 100);
  validateInput(propertyTaxes, errors.propertyTaxes, "Annual Property Taxes", 0);
  validateInput(insuranceCosts, errors.insuranceCosts, "Annual Insurance Costs", 0);
  validateInput(maintenanceCosts, errors.maintenanceCosts, "Annual Maintenance Costs", 0);
  validateInput(managementFees, errors.managementFees, "Management Fees (%)", 0, 100);
  validateInput(utilities, errors.utilities, "Utilities", 0);
  validateInput(renovations, errors.renovations, "Renovations", 0);
  validateInput(rentGrowth, errors.rentGrowth, "Rent Growth (%)", 0, 100);
  validateInput(closingCostsPercent, errors.closingCosts, "Closing Costs (%)", 0, 100);
  if (!isValid) return;

  // ✅ Loan Calculation
  let loanAmount = propertyPrice - downPayment;
  let monthlyRate = interestRate / 100 / 12;
  let numPayments = loanTerm * 12;

  let mortgagePayment =
    monthlyRate > 0
      ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
      : loanTerm > 0
        ? loanAmount / numPayments
        : 0;

  // ✅ Rental Income Calculation
  let grossRentIncome = monthlyRent * 12;
  let vacancyLoss = grossRentIncome * (vacancyRate / 100);
  let adjustedRentIncome = grossRentIncome - vacancyLoss;

  // ✅ Operating Expenses Calculation
  let operatingExpenses =
    propertyTaxes +
    insuranceCosts +
    maintenanceCosts +
    adjustedRentIncome * (managementFees / 100) +
    utilities +
    renovations
    ;

  // ✅ NOI Calculation
  let noi = adjustedRentIncome - operatingExpenses;

  // ✅ Annual Mortgage Payment
  let annualMortgagePayment = mortgagePayment * 12;

  // ✅ Cash Flow Calculation
  let cashFlowAnnual = noi - annualMortgagePayment;
  let cashFlowMonthly = cashFlowAnnual / 12;

  // ✅ Cap Rate Calculation
  let capRate = (noi / propertyPrice) * 100;

  // ✅ Cash-on-Cash Return Calculation
  let totalCashInvested = downPayment + closingCosts + renovations;
  let cocReturn = totalCashInvested > 0 ? (cashFlowAnnual / totalCashInvested) * 100 : 0;

  // ✅ Debt Service Ratio (DSR) Calculation
  let debtServiceRatio = annualMortgagePayment > 0 ? noi / annualMortgagePayment : 0;
  // For charts and table projections
  let rentProjections = [];
  let adjustedRentProjections = [];

  let monthlyPropertyTaxes = propertyTaxes / 12;
  let monthlyInsurance = insuranceCosts / 12;
  let monthlyMaintenance = maintenanceCosts / 12;
  let monthlyManagementFees = (adjustedRentIncome * (managementFees / 100)) / 12;
  let monthlyUtilities = utilities / 12;
  let monthlyRenovations = renovations / 12;

  let totalMonthlyCosts = mortgagePayment +
    monthlyPropertyTaxes +
    monthlyInsurance +
    monthlyMaintenance +
    monthlyManagementFees +
    monthlyUtilities +
    monthlyRenovations;

  for (let i = 0; i < timeDuration; i++) {
    let yearRent = monthlyRent * 12 * Math.pow(1 + rentGrowth / 100, i);
    let yearVacancyLoss = yearRent * (vacancyRate / 100);
    let yearAdjustedRent = yearRent - yearVacancyLoss;
    rentProjections.push(yearRent);
    adjustedRentProjections.push(yearAdjustedRent);
  }

  // ✅ Display Results
  document.getElementById("loanAmount").innerText = formatNumber(loanAmount);
  document.getElementById("mortgagePayment").innerText = formatNumber(totalMonthlyCosts);
  document.getElementById("noi").innerText = formatNumber(noi);
  document.getElementById("cashFlow").innerText = formatNumber(cashFlowMonthly);
  document.getElementById("capRate").innerText = formatNumberPercent(capRate) + "%";
  document.getElementById("cocReturn").innerText = formatNumberPercent(cocReturn) + "%";
  document.getElementById("annualCashFlow").innerText = formatNumber(cashFlowAnnual);
  document.getElementById("cashInvestedRent").innerText = formatNumber(totalCashInvested);
  document.getElementById("debtServiceRatio").innerText = debtServiceRatio.toFixed(2);

  // Change background color if DSR is greater than 1.2
  let dsrElement = document.getElementById("debtcard");
  if (debtServiceRatio > 1.2) {
    dsrElement.style.backgroundColor = "#d0b870";
    document.querySelector(".dssr").style.color = "black";

  } else {
    dsrElement.style.backgroundColor = "rgb(248, 109, 109)"; // Reset to default if DSR is not > 1.2
  }
  renderPortfolioPieChart(adjustedRentIncome, operatingExpenses, cashFlowAnnual, timeDuration);
  renderCashFlowPieChart(annualMortgagePayment, operatingExpenses, cashFlowAnnual, timeDuration);
  var year = parseFloat(document.getElementById("years_tbl").value.trim()) || 1;
  // document.getElementById("year_b").innerText = year;
  getTableData(year, true);
  updateTableRange();
}

function renderPortfolioPieChart(adjustedRentIncome, operatingExpenses, cashFlowAnnual, timeDuration = 1) {
  const ctx = document.getElementById("portfolioPieChart").getContext("2d");

  if (window.portfolioPieChart instanceof Chart) {
    window.portfolioPieChart.destroy();
  }

  // Scale values based on selected duration
  const scaledIncome = adjustedRentIncome * timeDuration;
  const scaledExpenses = operatingExpenses * timeDuration;
  const scaledCashFlow = cashFlowAnnual * timeDuration;

  const labels = ["Income", "Expenses"];
  const values = [scaledIncome, scaledExpenses];
  const colors = ["#B77CE9", "#55CBE5"];

  const profitLabel = scaledCashFlow >= 0 ? "Profit" : "Loss";
  const profitValue = Math.abs(scaledCashFlow);
  const profitColor = scaledCashFlow >= 0 ? "#3B8D21" : "#F39655";

  labels.push(profitLabel);
  values.push(profitValue);
  colors.push(profitColor);

  const total = values.reduce((a, b) => a + b, 0);

  window.portfolioPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: "#fff",
          borderWidth: 2,
          hoverOffset: 12,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "black",
            font: {
              size: 14,
              family: "Arial, sans-serif",
            },
            padding: 15,
          },
        },
        title: {
          display: true,
          text: `Portfolio Composition (Over ${timeDuration} Year${timeDuration > 1 ? "s" : ""})`,
          font: {
            size: 20,
            weight: "bold",
            family: "Arial, sans-serif",
          },
          color: "#333",
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = parseFloat(context.raw);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
            },
            afterBody: function () {
              return `Total: $${total.toFixed(2)}`;
            },
          },
        },
        datalabels: {
          color: "white",
          font: {
            size: 14,
            weight: "bold",
          },
          formatter: (value, context) => {
            const sum = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = ((value / sum) * 100).toFixed(1);
            return percentage >= 5 ? `${percentage}%` : "";
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}

function renderCashFlowPieChart(mortgagePaymentAnnual, operatingExpenses, cashFlowAnnual, timeDuration = 1) {
  const ctx = document.getElementById("cashFlowPieChart").getContext("2d");

  if (window.cashFlowPieChart instanceof Chart) {
    window.cashFlowPieChart.destroy();
  }

  // Scale all values by time duration (in years)
  const scaledMortgage = mortgagePaymentAnnual * timeDuration;
  const scaledExpenses = operatingExpenses * timeDuration;
  const scaledCashFlow = cashFlowAnnual * timeDuration;

  const labels = ["Mortgage Payments", "Operating Expenses"];
  const values = [scaledMortgage, scaledExpenses];
  const colors = ["#55CBE5", "#F39655"];

  const netLabel = scaledCashFlow >= 0 ? "Net Profit" : "Net Loss";
  const netColor = scaledCashFlow >= 0 ? "#4CAF50" : "#FF5722";

  labels.push(netLabel);
  values.push(Math.abs(scaledCashFlow));
  colors.push(netColor);

  const totalFlow = values.reduce((acc, val) => acc + val, 0);

  window.cashFlowPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Cash Flow Breakdown",
          data: values.map(val => val.toFixed(2)),
          backgroundColor: colors,
          hoverOffset: 15,
          borderWidth: 3,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `Cash Flow Breakdown (Over ${timeDuration} Year${timeDuration > 1 ? "s" : ""})`,
          font: {
            size: 22,
            weight: "bold",
          },
          color: "#333",
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          titleFont: {
            size: 20,
            weight: "bold",
          },
          bodyFont: {
            size: 16,
          },
          padding: 14,
          boxPadding: 6,
          borderColor: "#fff",
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = parseFloat(context.raw);
              const percentage = ((value / totalFlow) * 100).toFixed(2);
              return `${label}: $${value.toFixed(2)} (${percentage}%)`;
            },
            afterBody: function () {
              return `Total: $${totalFlow.toFixed(2)}`;
            },
          },
        },
        legend: {
          display: true,
          labels: {
            font: {
              size: 16,
            },
            boxWidth: 25,
            usePointStyle: true,
            padding: 20,
          },
        },
        datalabels: {
          color: "white",
          font: {
            size: 14,
            weight: "bold",
          },
          formatter: (value, context) => {
            const sum = context.chart.data.datasets[0].data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
            const percentage = ((value / sum) * 100).toFixed(1);
            return percentage >= 5 ? `${percentage}%` : "";
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1500,
          easing: "easeOutBounce",
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}


document.getElementById("download-pdf").addEventListener("click", function () {
  if (window.jspdf && typeof html2canvas !== "undefined") {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Function to get values from input fields
    function getValue(id) {
      const element = document.getElementById(id);
      return element && element.value ? element.value : "N/A";
    }

    // Combine existing content and house flipping analysis into a single div
    const combinedDiv = document.createElement("div");
    combinedDiv.id = "combinedContent";
    combinedDiv.style.padding = "20px";
    combinedDiv.style.backgroundColor = "#fff";
    combinedDiv.style.color = "#000";
    combinedDiv.style.width = "800px";
    combinedDiv.style.margin = "auto";

    // Clone the original content
    const contentDiv = document.getElementById("contentPDF");
    combinedDiv.appendChild(contentDiv.cloneNode(true));

    // Create results section
    const resultsDiv = document.createElement("div");
    resultsDiv.innerHTML = `
      <h2 style="text-align:center; margin-top: 20px;">Inputs</h2>
      <table border="1" cellspacing="0" cellpadding="5" style="width:100%; text-align:left;">
        <tr><td><strong>Property Address:</strong></td><td>$${getValue("propertyAddress")}</td></tr>
        <tr><td><strong>Property Purchase Price:</strong></td><td>$${getValue("purchasePrice")}</td></tr>
        <tr><td><strong>Renovation Costs:</strong></td><td>$${getValue("renoCosts")}</td></tr>
        <tr><td><strong>Closing Costs:</strong></td><td>${getValue("closingCosts")}%</td></tr>
        <tr><td><strong>Holding Costs:</strong></td><td>$${getValue("holdingCosts")}</td></tr>
        <tr><td><strong>After Repair Value:</strong></td><td>$${getValue("afterRepairValue")}</td></tr>
        <tr><td><strong>Project Months:</strong></td><td>${getValue("projectMonths")} Months</td></tr>
        <tr><td><strong>House Monthly Rent:</strong></td><td>$${getValue("houseMonthlyRent")}</td></tr>
        <tr><td><strong>House Interest Rate:</strong></td><td>${getValue("houseinterestRate")}%</td></tr>
        <tr><td><strong>Loan Points:</strong></td><td>${getValue("loanPoints")}%</td></tr>
        <tr><td><strong>Loan Term:</strong></td><td>${getValue("houseLoanYear")} Years</td></tr>
        <tr><td><strong>Gap Costs:</strong></td><td>$${getValue("gapCosts")}</td></tr>
        <tr><td><strong>Down Payment Percent:</strong></td><td>${getValue("downPaymentPercent")}%</td></tr>
        <tr><td><strong>Resale Costs:</strong></td><td>$${getValue("resaleCosts")}</td></tr>
        <tr><td><strong>Desired Profit Margin:</strong></td><td>${getValue("desiredProfitMargin")}%</td></tr>
        <tr><td><strong>Down Payment Based On:</strong></td><td>$${getValue("downPaymentType")}</td></tr>
        <tr><td><strong>Annual Maintenance:</strong></td><td>$${getValue("houseAnnualMaintenance")}</td></tr>
        <tr><td><strong>Annual Utilities:</strong></td><td>$${getValue("houseAnnualUtilities")}</td></tr>
        <tr><td><strong>Annual Insurance:</strong></td><td>$${getValue("insurance")}</td></tr>
        <tr><td><strong>Annual Property Taxes:</strong></td><td>$${getValue("propertyTaxesHF")}</td></tr>
      </table>
    `;
    combinedDiv.appendChild(resultsDiv);
    document.body.appendChild(combinedDiv); // Append to document for rendering

    // Capture content as multiple images
    html2canvas(combinedDiv, { scale: 2, useCORS: true }).then(canvas => {
      const imgWidth = 190;
      const pageHeight = doc.internal.pageSize.height;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      const imgData = canvas.toDataURL("image/png");

      // Add first page
      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      // Add additional pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      doc.save("house_flipping_analysis.pdf");
      combinedDiv.remove(); // Clean up temporary div
    }).catch(error => {
      console.error("Error capturing HTML content:", error);
    });

  } else {
    console.error("jsPDF or html2canvas not loaded correctly.");
  }
});


document.getElementById("download-pdf2").addEventListener("click", function () {
  if (window.jspdf && typeof html2canvas !== "undefined") {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Function to get values from input fields
    function getValue(id) {
      const element = document.getElementById(id);
      return element && element.value ? element.value : "N/A";
    }

    // Combine the existing content and retirement planning analysis into a single div
    const combinedDiv = document.createElement("div");
    combinedDiv.id = "combinedContent";
    combinedDiv.style.padding = "20px";
    combinedDiv.style.backgroundColor = "#fff";
    combinedDiv.style.color = "#000";
    combinedDiv.style.width = "800px";
    combinedDiv.style.margin = "auto";

    // Clone the original content
    const contentDiv = document.getElementById("contentPDF2");
    combinedDiv.appendChild(contentDiv.cloneNode(true));

    // Create results section
    const resultsDiv = document.createElement("div");
    resultsDiv.innerHTML = `
      <h2 style="text-align:center; margin-top: 20px;">Retirement Planning Inputs</h2>
      <table border="1" cellspacing="0" cellpadding="5" style="width:100%; text-align:left;">
        <tr><td><strong>Current Age:</strong></td><td>${getValue("currentAge")}</td></tr>
        <tr><td><strong>Retirement Age:</strong></td><td>${getValue("retirementAge")}</td></tr>
        <tr><td><strong>Current Savings:</strong></td><td>$${getValue("currentSavings")}</td></tr>
        <tr><td><strong>Monthly Contributions:</strong></td><td>$${getValue("monthlyContributions")}</td></tr>
        <tr><td><strong>Annual Return:</strong></td><td>${getValue("annualReturn")}%</td></tr>
        <tr><td><strong>Inflation Rate:</strong></td><td>${getValue("inflationRate")}%</td></tr>
        <tr><td><strong>Desired Income:</strong></td><td>$${getValue("desiredIncome")}</td></tr>
        <tr><td><strong>Whole Life Insurance Value:</strong></td><td>$${getValue("wholeLifeInsurance")}</td></tr>
        <tr><td><strong>Monthly Contributions to Whole Life Insurance:</strong></td><td>$${getValue("lifeInsuranceMonthlyContributions")}</td></tr>
        <tr><td><strong>Current Stock Value:</strong></td><td>$${getValue("currentStockValue")}</td></tr>
        <tr><td><strong>Current Real Estate Equity:</strong></td><td>$${getValue("currentRealEstateEquity")}</td></tr>
        <tr><td><strong>Current Mortgage Balance:</strong></td><td>$${getValue("mortgageBalance")}</td></tr>
        <tr><td><strong>Mortgage Term (Years):</strong></td><td>$${getValue("mortgageTerm")}</td></tr>
        <tr><td><strong>Mortgage Interest Rate (%):</strong></td><td>$${getValue("mortgageInterestRate")}</td></tr>
      </table>
    `;
    combinedDiv.appendChild(resultsDiv);
    document.body.appendChild(combinedDiv); // Append to document for rendering

    // Capture content as multiple images
    html2canvas(combinedDiv, { scale: 2, useCORS: true }).then(canvas => {
      const imgWidth = 190;
      const pageHeight = doc.internal.pageSize.height;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      const imgData = canvas.toDataURL("image/png");

      // Add first page
      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      // Add additional pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      doc.save("retirement_planning_calculator.pdf");
      combinedDiv.remove(); // Clean up temporary div
    }).catch(error => {
      console.error("Error capturing HTML content:", error);
    });

  } else {
    console.error("jsPDF or html2canvas not loaded correctly.");
  }
});


document.getElementById("download-pdf3").addEventListener("click", function () {
  if (window.jspdf && typeof html2canvas !== "undefined") {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Function to get values from input fields
    function getValue(id) {
      const element = document.getElementById(id);
      return element && element.value ? element.value : "N/A";
    }

    const contentDiv = document.getElementById("contentPDF3"); // First page content

    // Step 1: Capture the first section (contentPDF3)
    html2canvas(contentDiv, { scale: 2, useCORS: true }).then(canvas => {
      const imgWidth = 190;
      const pageHeight = doc.internal.pageSize.height;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      const imgData = canvas.toDataURL("image/png");

      // Add first page content
      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      // Add new pages if necessary
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      doc.addPage(); // Move to next page for input data

      // Step 2: Create results section
      const resultsDiv = document.createElement("div");
      resultsDiv.style.padding = "20px";
      resultsDiv.style.backgroundColor = "#fff";
      resultsDiv.style.color = "#000";
      resultsDiv.style.width = "800px";
      resultsDiv.style.margin = "auto";
      resultsDiv.innerHTML = `
        <h2 style="text-align:center; margin-top: 20px;">Rental Property Inputs</h2>
        <table border="1" cellspacing="0" cellpadding="5" style="width:100%; text-align:left;">
          <tr><td><strong>Property Price:</strong></td><td>$${getValue("propertyPrice")}</td></tr>
          <tr><td><strong>Down Payment:</strong></td><td>$${getValue("downPayment")}</td></tr>
          <tr><td><strong>Loan Term:</strong></td><td>${getValue("loanTerm")} Years</td></tr>
          <tr><td><strong>Interest Rate:</strong></td><td>${getValue("interestRate")}%</td></tr>
          <tr><td><strong>Monthly Rent:</strong></td><td>$${getValue("monthlyRent")}</td></tr>
          <tr><td><strong>Vacancy Rate:</strong></td><td>${getValue("vacancyRate")}%</td></tr>
          <tr><td><strong>Closing Cost:</strong></td><td>${getValue("closingCostsRent")}%</td></tr>
          <tr><td><strong>Property Taxes:</strong></td><td>$${getValue("propertyTaxes")}</td></tr>
          <tr><td><strong>Annual Renovations:</strong></td><td>$${getValue("renovations")}</td></tr>
          <tr><td><strong>Annual Utilities:</strong></td><td>$${getValue("utilities")}</td></tr>
          <tr><td><strong>Insurance Costs:</strong></td><td>$${getValue("insuranceCosts")}</td></tr>
          <tr><td><strong>Maintenance Costs:</strong></td><td>$${getValue("maintenanceCosts")}</td></tr>
          <tr><td><strong>Management Fees:</strong></td><td>$${getValue("managementFees")}</td></tr>
          <tr><td><strong>Property Appreciation Rate:</strong></td><td>${getValue("appreciationRate")}%</td></tr>
          <tr><td><strong>Annual Rent Growth:</strong></td><td>${getValue("rentGrowth")}%</td></tr>
        </table>
      `;

      document.body.appendChild(resultsDiv); // Append to document for rendering

      // Step 3: Capture the results section
      html2canvas(resultsDiv, { scale: 2, useCORS: true }).then(canvas2 => {
        const imgData2 = canvas2.toDataURL("image/png");
        const imgWidth2 = 190;
        const imgHeight2 = (canvas2.height * imgWidth2) / canvas2.width;
        let heightLeft2 = imgHeight2;
        let position2 = 10;

        // Add new pages if needed
        while (heightLeft2 > 0) {
          doc.addImage(imgData2, "PNG", 10, position2, imgWidth2, imgHeight2);
          heightLeft2 -= pageHeight - 20;
          if (heightLeft2 > 0) doc.addPage();
        }

        doc.save("rental_property_evaluation.pdf"); // Save PDF
        resultsDiv.remove(); // Clean up temporary div
      });

    }).catch(error => {
      console.error("Error capturing HTML content:", error);
    });

  } else {
    console.error("jsPDF or html2canvas not loaded correctly.");
  }
});

// function getTableData(year) {
//   document.getElementById("year_b").innerHTML = year;
//   // Get values and convert to numbers
//   let propertyPrice = parseFloat(document.getElementById("propertyPrice").value.trim()) || 0;
//   let downPayment = parseFloat(document.getElementById("downPayment").value.trim()) || 0;
//   let loanTerm = parseFloat(document.getElementById("loanTerm").value.trim()) || 0;
//   let interestRate = parseFloat(document.getElementById("interestRate").value.trim()) || 0;
//   let monthlyRent = parseFloat(document.getElementById("monthlyRent").value.trim()) || 0;
//   let vacancyRate = parseFloat(document.getElementById("vacancyRate").value.trim()) || 0;
//   let propertyTaxes = parseFloat(document.getElementById("propertyTaxes").value.trim()) || 0;
//   let insuranceCosts = parseFloat(document.getElementById("insuranceCosts").value.trim()) || 0;
//   let maintenanceCosts = parseFloat(document.getElementById("maintenanceCosts").value.trim()) || 0;
//   let managementFees = parseFloat(document.getElementById("managementFees").value.trim()) || 0;
//   let appreciationRate = parseFloat(document.getElementById("appreciationRate").value.trim()) || 3;
//   let rentIncreaseRate = 2; // Assuming rent increases 2% annually

//   // Validate year parameter
//   if (!year || year < 1 || year > loanTerm) {
//     return;
//   }

//   // ✅ Loan Calculation
//   let loanAmount = propertyPrice - downPayment;
//   let monthlyRate = interestRate / 100 / 12;
//   let numPayments = loanTerm * 12;

//   let mortgagePayment = monthlyRate > 0
//     ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1)
//     : loanAmount / numPayments;

//   // ✅ Appreciation & Rent Growth Calculations
//   let appreciationFactor = Math.pow(1 + appreciationRate / 100, year);
//   let rentFactor = Math.pow(1 + rentIncreaseRate / 100, year);

//   let propertyValue = propertyPrice * appreciationFactor;
//   // let grossRentIncome = (monthlyRent * 12) * rentFactor; // Rent grows separately
//   let grossRentIncome = monthlyRent * 12;
//   let vacancyLoss = grossRentIncome * (vacancyRate / 100);
//   let managementCost = grossRentIncome * (managementFees / 100);
//   // let vacancyLoss = grossRentIncome * (vacancyRate / 100);
//   let adjustedRentIncome = grossRentIncome - vacancyLoss;

//   // ✅ Operating Expenses Growth
//   let totalFixedExpenses = propertyTaxes + insuranceCosts + maintenanceCosts;
//   // let operatingExpenses = (totalFixedExpenses * appreciationFactor) + (adjustedRentIncome * (managementFees / 100));
//   let operatingExpenses =
//     vacancyLoss +
//     propertyTaxes +
//     insuranceCosts +
//     maintenanceCosts +
//     managementCost +
//     utilities +
//     renovations;
//   // ✅ Net Operating Income (NOI)
//   // let noi = adjustedRentIncome - operatingExpenses;
//   let noi = grossRentIncome - operatingExpenses;

//   // ✅ Annual Mortgage Payment (remains fixed)
//   let annualMortgagePayment = mortgagePayment * 12;

//   // ✅ Cash Flow Calculation
//   let cashFlowAnnual = noi - annualMortgagePayment;
//   let cashFlowMonthly = cashFlowAnnual / 12;

//   // ✅ Display Results in Table
//   document.getElementById("gross_rent").innerText = `$${grossRentIncome.toFixed(2)}`;
//   document.getElementById("vacancy_rate").innerText = `– $${vacancyLoss.toFixed(2)}`;
//   document.getElementById("operating_income").innerText = `$${adjustedRentIncome.toFixed(2)}`;
//   document.getElementById("operating_expenses").innerText = `– $${operatingExpenses.toFixed(2)}`;
//   document.getElementById("net_operating_income").innerText = `$${noi.toFixed(2)}`;
//   document.getElementById("loan_payments").innerText = `– $${annualMortgagePayment.toFixed(2)}`;
//   document.getElementById("cash_flow").innerText = `$${cashFlowAnnual.toFixed(2)}`;

//   console.log(`Data displayed for year: ${year}`);
// }

// Function to populate the years dropdown
function populateYearsDropdown() {
  const select = document.getElementById("years_tbl");
  select.innerHTML = "";  // Clear existing options

  for (let i = 1; i <= 30; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${i} ${i === 1 ? 'Year' : 'Years'}`;

    // Set 10 years as the default selected value
    if (i === 1) {
      option.selected = true;
    }

    select.appendChild(option);
  }
}

document.getElementById("years_tbl").addEventListener("change", function () {
  let selectedValue = this.value;
  getTableData(selectedValue);
});

// Call the function to populate the dropdown on page load
window.onload = populateYearsDropdown;

function printSpecificSection(classNames) {
  if (!Array.isArray(classNames) || classNames.length === 0) return;

  const chartContainer = document.querySelector(classNames[0]);
  const contentContainer = document.querySelector(classNames[1]);

  if (!chartContainer || !contentContainer) return;

  const canvases = chartContainer.querySelectorAll('canvas');

  setTimeout(() => {
    const tempDiv = document.createElement('div');
    const clonedContent = contentContainer.cloneNode(true);
    tempDiv.appendChild(clonedContent);
    // 1. Render canvas charts to images
    canvases.forEach((canvas) => {
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.width = '100%';
      img.style.marginBottom = '20px';
      tempDiv.appendChild(img);
    });

    // 3. Open a print window
    const printWindow = window.open('', '', 'width=1000,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Section</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            img { max-width: 100%; margin-bottom: 20px; }
            .card {
              border: 1px solid #ccc;
              padding: 15px;
              margin: 10px;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .result {
              font-weight: bold;
              color: #333;
              margin-top: 5px;
            }
            h1, h4 {
              color: #bfa046;
              margin: 10px 0;
            }
            .dssr {
              background: #d8c07c;
              padding: 10px;
              border-radius: 6px;
              display: inline-block;
            }
            .text-dark { color: #333; }
            .text-center { text-align: center; }
            /* Add any extra styles used in your '.retire' content */
          </style>
        </head>
        <body>
          ${tempDiv.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);

  }, 300);
}

function printChartsAndTable(chartClass, tableClass, summaryDivId) {
  const chartContainer = document.querySelector(chartClass);
  const tableContainer = document.querySelector(tableClass);
  const summaryDiv = document.querySelector(summaryDivId);
  if (!chartContainer || !tableContainer || !summaryDiv) return;

  const canvases = chartContainer.querySelectorAll('canvas');

  setTimeout(() => {
    const tempDiv = document.createElement('div');

    // Clone the summary section
    const summaryClone = summaryDiv.cloneNode(true);
    summaryClone.style.marginBottom = "40px";
    tempDiv.appendChild(summaryClone);

    // Add charts as images
    canvases.forEach((canvas) => {
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.width = '100%';
      img.style.marginBottom = '20px';
      tempDiv.appendChild(img);
    });

    // Clone the table HTML
    const tableClone = tableContainer.cloneNode(true);
    tableClone.style.marginTop = "40px";
    tableClone.style.border = "1px solid #ccc";
    tempDiv.appendChild(tableClone);

    const printWindow = window.open('', '', 'width=1000,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1, h4 {
              color: #bfa046;
              margin: 10px 0;
            }
            img {
              max-width: 100%;
              margin-bottom: 20px;
            }
            .card {
              border: 1px solid #ccc;
              padding: 15px;
              margin: 10px;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              padding: 10px;
              border: 1px solid #ccc;
              text-align: left;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .result {
              font-weight: bold;
              color: #333;
              margin-top: 5px;
            }
            .dssr {
              background: #d8c07c;
              padding: 10px;
              border-radius: 6px;
              display: inline-block;
            }
            .text-dark {
              color: #333;
            }
            .text-center {
              text-align: center;
            }
          </style>
        </head>
        <body>
          ${tempDiv.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }, 300);
}

function updateTableRange() {
  const selectedYear = parseInt(document.getElementById("years_tbl").value);
  const tableContainer = document.getElementById("yearlyTables");
  tableContainer.innerHTML = "";

  let years = [];
  if (selectedYear <= 1) {
    years = [0, 1, 2];
  } else if (selectedYear >= 30) {
    years = [28, 29, 30];
  } else {
    years = [selectedYear - 1, selectedYear, selectedYear + 1];
  }

  const tableData = years.map((year) => getTableData(year, true)).filter(Boolean);
  if (tableData.length > 0) {
    const combinedTable = generateCombinedYearTable(tableData);
    tableContainer.appendChild(combinedTable);
  }
}


function getTableData(year, returnData = false) {
  // Get values and convert to numbers
  let propertyPrice = parseFloat(document.getElementById("propertyPrice").value.trim()) || 0;
  let downPayment = parseFloat(document.getElementById("downPayment").value.trim()) || 0;
  let loanTerm = parseFloat(document.getElementById("loanTerm").value.trim()) || 0;
  let interestRate = parseFloat(document.getElementById("interestRate").value.trim()) || 0;
  let monthlyRent = parseFloat(document.getElementById("monthlyRent").value.trim()) || 0;
  let vacancyRate = parseFloat(document.getElementById("vacancyRate").value.trim()) || 0;
  let propertyTaxes = parseFloat(document.getElementById("propertyTaxes").value.trim()) || 0;
  let insuranceCosts = parseFloat(document.getElementById("insuranceCosts").value.trim()) || 0;
  let maintenanceCosts = parseFloat(document.getElementById("maintenanceCosts").value.trim()) || 0;
  let managementFees = parseFloat(document.getElementById("managementFees").value.trim()) || 0;
  let appreciationRate = parseFloat(document.getElementById("appreciationRate").value.trim()) || 3;
  let rentIncreaseRate = 2;
  let utilities = parseFloat(document.getElementById("utilities").value.trim()) || 0;
  let renovations = parseFloat(document.getElementById("renovations").value.trim()) || 0;

  if (!year || year < 0) return;

  // Loan calculation
  let loanAmount = propertyPrice - downPayment;
  let monthlyRate = interestRate / 100 / 12;
  let numPayments = loanTerm * 12;
  let mortgagePayment = monthlyRate > 0
    ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments;

  // Appreciation and Rent growth
  let appreciationFactor = Math.pow(1 + appreciationRate / 100, year);
  let rentFactor = Math.pow(1 + rentIncreaseRate / 100, year);

  let grossRentIncome = (monthlyRent * 12) * rentFactor;
  let vacancyLoss = grossRentIncome * (vacancyRate / 100);
  let adjustedRentIncome = grossRentIncome - vacancyLoss;
  let managementCost = grossRentIncome * (managementFees / 100);

  // Operating Expenses
  let operatingExpenses =
    vacancyLoss +
    propertyTaxes +
    insuranceCosts +
    maintenanceCosts +
    managementCost +
    utilities +
    renovations;

  let netOperatingIncome = grossRentIncome - operatingExpenses;
  let annualMortgagePayment = mortgagePayment * 12;
  let cashFlowAnnual = netOperatingIncome - annualMortgagePayment;

  // If returnData is true, send values back instead of updating UI
  if (returnData) {
    return {
      year,
      grossRentIncome,
      vacancyLoss,
      adjustedRentIncome,
      operatingExpenses,
      netOperatingIncome,
      annualMortgagePayment,
      capitalExpenditures: 1425, // or dynamic later
      cashFlow: cashFlowAnnual,
    };
  }

  // Update UI
  document.getElementById("year_b").innerHTML = year;
  document.getElementById("gross_rent").innerText = `$${grossRentIncome.toFixed(2)}`;
  document.getElementById("vacancy_rate").innerText = `– $${vacancyLoss.toFixed(2)}`;
  document.getElementById("operating_income").innerText = `$${adjustedRentIncome.toFixed(2)}`;
  document.getElementById("operating_expenses").innerText = `– $${operatingExpenses.toFixed(2)}`;
  document.getElementById("net_operating_income").innerText = `$${netOperatingIncome.toFixed(2)}`;
  document.getElementById("loan_payments").innerText = `– $${annualMortgagePayment.toFixed(2)}`;
  document.getElementById("cash_flow").innerText = `$${cashFlowAnnual.toFixed(2)}`;

  console.log(`Data displayed for year: ${year}`);
}


// function generateYearTable(data, year) {
//   const div = document.createElement("div");
//   div.classList.add("mb-5");
//   div.innerHTML = `
//     <h5>Year ${year}</h5>
//     <table class="table table-bordered">
//       <thead>
//         <tr><th>Category</th><th>Amount</th></tr>
//       </thead>
//       <tbody>
//         <tr><td>Gross Rent</td><td>$${data.grossRentIncome.toFixed(2)}</td></tr>
//         <tr><td>Vacancy</td><td>– $${data.vacancyLoss.toFixed(2)}</td></tr>
//         <tr><td>Operating Income</td><td>$${data.adjustedRentIncome.toFixed(2)}</td></tr>
//         <tr><td>Operating Expenses</td><td>– $${data.operatingExpenses.toFixed(2)}</td></tr>
//         <tr><td class="ps-4">Property Taxes</td><td>$${parseFloat(document.getElementById("propertyTaxes").value || 0).toFixed(2)}</td></tr>
//         <tr><td class="ps-4">Insurance</td><td>$${parseFloat(document.getElementById("insuranceCosts").value || 0).toFixed(2)}</td></tr>
//         <tr><td class="ps-4">Maintenance</td><td>$${parseFloat(document.getElementById("maintenanceCosts").value || 0).toFixed(2)}</td></tr>
//         <tr><td class="ps-4">Management Fees</td><td>$${(data.adjustedRentIncome * (parseFloat(document.getElementById("managementFees").value || 0) / 100)).toFixed(2)}</td></tr>
//         <tr><td class="ps-4">Vacancy Loss</td><td>$${data.vacancyLoss.toFixed(2)}</td></tr>
//         <tr><td class="ps-4">Utilities</td><td>$${parseFloat(document.getElementById("utilities").value || 0).toFixed(2)}</td></tr>
//         <tr><td class="ps-4">Renovations</td><td>$${parseFloat(document.getElementById("renovations").value || 0).toFixed(2)}</td></tr>
//         <tr class="fw-bold"><td>Net Operating Income (NOI)</td><td>$${data.netOperatingIncome.toFixed(2)}</td></tr>
//         <tr><td>Loan Payments</td><td>– $${data.annualMortgagePayment.toFixed(2)}</td></tr>
//         <tr><td>Capital Expenditures</td><td>– $${data.capitalExpenditures.toFixed(2)}</td></tr>
//         <tr class="fw-bold"><td>Cash Flow</td><td>$${data.cashFlow.toFixed(2)}</td></tr>
//       </tbody>
//     </table>
//   `;
//   return div;
// }
function generateCombinedYearTable(dataArray) {
  const dynamicCategories = [
    "Gross Rent",
    "Vacancy",
    "Operating Income",
    "Operating Expenses",
    "Management Fees",
    "Vacancy Loss",
    "Net Operating Income (NOI)",
    "Loan Payments",
    "Capital Expenditures",
    "Cash Flow"
  ];

  const staticExpenses = {
    "Property Taxes": parseFloat(document.getElementById("propertyTaxes").value) || 0,
    "Insurance": parseFloat(document.getElementById("insuranceCosts").value) || 0,
    "Maintenance": parseFloat(document.getElementById("maintenanceCosts").value) || 0,
    "Utilities": parseFloat(document.getElementById("utilities").value) || 0,
    "Renovations": parseFloat(document.getElementById("renovations").value) || 0,
  };

  const div = document.createElement("div");
  div.classList.add("mb-5", "table-design");

  // 🌟 Static Expenses Table
  let staticTable = `
    <h5>Fixed Annual Expenses</h5>
    <table class="table table-bordered">
      <thead class="clr-bg" style="background-color: #333333; color: white;">
        <tr><th>Category</th><th>Amount</th></tr>
      </thead>
      <tbody>
        ${Object.entries(staticExpenses).map(([key, val]) => `
          <tr><td>${key}</td><td>$${val.toFixed(2)}</td></tr>
        `).join("")}
      </tbody>
    </table>
  `;

  // 📅 Yearly Data Table (Dynamic Values)
  let dynamicTable = `
    <h5>Yearly Financials: Years ${dataArray.map(d => d.year).join(", ")}</h5>
    <table class="table table-bordered">
      <thead class="clr-bg" style="background-color: #333333; color: white;">
        <tr>
          <th>Category</th>
          ${dataArray.map(d => `<th>Year ${d.year}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
  `;

  dynamicCategories.forEach(cat => {
    dynamicTable += `<tr><td>${cat}</td>`;
    dataArray.forEach(data => {
      let value = 0;
      switch (cat) {
        case "Gross Rent": value = data.grossRentIncome; break;
        case "Vacancy": value = data.vacancyLoss; break;
        case "Operating Income": value = data.adjustedRentIncome; break;
        case "Operating Expenses": value = data.operatingExpenses; break;
        case "Management Fees":
          value = data.adjustedRentIncome * (parseFloat(document.getElementById("managementFees").value) || 0) / 100;
          break;
        case "Vacancy Loss": value = data.vacancyLoss; break;
        case "Net Operating Income (NOI)": value = data.netOperatingIncome; break;
        case "Loan Payments": value = -data.annualMortgagePayment; break;
        case "Capital Expenditures": value = -data.capitalExpenditures; break;
        case "Cash Flow": value = data.cashFlow; break;
      }
      dynamicTable += `<td>$${value.toFixed(2)}</td>`;
    });
    dynamicTable += `</tr>`;
  });

  dynamicTable += `</tbody></table>`;

  // 🧩 Combine and Return
  div.innerHTML = dynamicTable + staticTable;
  return div;
}
