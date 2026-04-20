"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Send, Users, DollarSign, Home, Car, FileText } from "lucide-react";
import { submitScholarshipApplication } from "@/server/actions/scholarship.actions";

interface ScholarshipFormProps {
  applicationId: string;
  studentName: string;
  referenceNumber: string;
}

export function ScholarshipForm({
  applicationId,
  studentName,
  referenceNumber,
}: ScholarshipFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [certified, setCertified] = useState(false);
  const [housingType, setHousingType] = useState<"rent" | "own">("rent");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!certified) {
      setMessage({ text: "You must certify the information is accurate.", type: "error" });
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const g = (name: string) => fd.get(name)?.toString() ?? "";
    const n = (name: string) => {
      const val = fd.get(name)?.toString();
      return val ? parseFloat(val) : 0;
    };

    const data = {
      familyInfo: {
        fatherName: g("familyInfo.fatherName"),
        motherName: g("familyInfo.motherName"),
        address: g("familyInfo.address"),
        city: g("familyInfo.city"),
        state: g("familyInfo.state"),
        zip: g("familyInfo.zip"),
        phone: g("familyInfo.phone"),
        email: g("familyInfo.email"),
        numberOfChildren: n("familyInfo.numberOfChildren"),
        childrenAges: g("familyInfo.childrenAges"),
      },
      fatherIncome: {
        occupation: g("fatherIncome.occupation"),
        employer: g("fatherIncome.employer"),
        annualGrossSalary: n("fatherIncome.annualGrossSalary"),
        checkingSavings: n("fatherIncome.checkingSavings"),
        investmentIncome: n("fatherIncome.investmentIncome"),
        businessIncome: n("fatherIncome.businessIncome"),
        rentalIncome: n("fatherIncome.rentalIncome"),
        otherIncome: n("fatherIncome.otherIncome"),
        totalIncome:
          n("fatherIncome.annualGrossSalary") +
          n("fatherIncome.checkingSavings") +
          n("fatherIncome.investmentIncome") +
          n("fatherIncome.businessIncome") +
          n("fatherIncome.rentalIncome") +
          n("fatherIncome.otherIncome"),
      },
      motherIncome: {
        occupation: g("motherIncome.occupation"),
        employer: g("motherIncome.employer"),
        annualGrossSalary: n("motherIncome.annualGrossSalary"),
        checkingSavings: n("motherIncome.checkingSavings"),
        investmentIncome: n("motherIncome.investmentIncome"),
        businessIncome: n("motherIncome.businessIncome"),
        rentalIncome: n("motherIncome.rentalIncome"),
        otherIncome: n("motherIncome.otherIncome"),
        totalIncome:
          n("motherIncome.annualGrossSalary") +
          n("motherIncome.checkingSavings") +
          n("motherIncome.investmentIncome") +
          n("motherIncome.businessIncome") +
          n("motherIncome.rentalIncome") +
          n("motherIncome.otherIncome"),
      },
      expenses: {
        incomeTaxes: {
          federalCurrentYear: n("expenses.tax.federalCurrent"),
          federalPriorYear: n("expenses.tax.federalPrior"),
          stateCurrentYear: n("expenses.tax.stateCurrent"),
          statePriorYear: n("expenses.tax.statePrior"),
          ficaCurrentYear: n("expenses.tax.ficaCurrent"),
          ficaPriorYear: n("expenses.tax.ficaPrior"),
          otherCurrentYear: n("expenses.tax.otherCurrent"),
          otherPriorYear: n("expenses.tax.otherPrior"),
        },
        housing: {
          type: housingType,
          monthlyRent: housingType === "rent" ? n("expenses.housing.monthlyRent") : 0,
          mortgagePayment: housingType === "own" ? n("expenses.housing.mortgagePayment") : 0,
          propertyTax: housingType === "own" ? n("expenses.housing.propertyTax") : 0,
          homeInsurance: housingType === "own" ? n("expenses.housing.homeInsurance") : 0,
          marketValue: housingType === "own" ? n("expenses.housing.marketValue") : 0,
          loanBalance: housingType === "own" ? n("expenses.housing.loanBalance") : 0,
        },
        monthlyHousehold: {
          clothing: n("expenses.household.clothing"),
          food: n("expenses.household.food"),
          householdHelp: n("expenses.household.householdHelp"),
          medical: n("expenses.household.medical"),
        },
        utilities: {
          gas: n("expenses.utilities.gas"),
          electric: n("expenses.utilities.electric"),
          water: n("expenses.utilities.water"),
          phone: n("expenses.utilities.phone"),
        },
        automobile: {
          year: g("expenses.auto.year"),
          make: g("expenses.auto.make"),
          model: g("expenses.auto.model"),
          monthlyRepairs: n("expenses.auto.repairs"),
          loanPayment: n("expenses.auto.loanPayment"),
        },
      },
      scholarshipRequest: {
        affordableAmount: n("request.affordableAmount"),
        requestedAmount: n("request.requestedAmount"),
        reason: g("request.reason"),
      },
      references: [
        {
          name: g("ref1.name"),
          phone: g("ref1.phone"),
          relationship: g("ref1.relationship"),
        },
        {
          name: g("ref2.name"),
          phone: g("ref2.phone"),
          relationship: g("ref2.relationship"),
        },
      ],
      certified: true,
    };

    startTransition(async () => {
      const result = await submitScholarshipApplication(applicationId, data);
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: result.message ?? "Submitted!", type: "success" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Scholarship Application for {studentName}
          </CardTitle>
          <CardDescription>
            All information is confidential.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Family Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Family Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="familyInfo.fatherName">Father&apos;s Name</Label>
              <Input id="familyInfo.fatherName" name="familyInfo.fatherName" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="familyInfo.motherName">Mother&apos;s Name</Label>
              <Input id="familyInfo.motherName" name="familyInfo.motherName" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="familyInfo.address">Address</Label>
              <Input id="familyInfo.address" name="familyInfo.address" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="familyInfo.city">City</Label>
              <Input id="familyInfo.city" name="familyInfo.city" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="familyInfo.state">State</Label>
                <Input id="familyInfo.state" name="familyInfo.state" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="familyInfo.zip">Zip</Label>
                <Input id="familyInfo.zip" name="familyInfo.zip" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="familyInfo.phone">Phone</Label>
              <Input id="familyInfo.phone" name="familyInfo.phone" type="tel" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="familyInfo.email">Email</Label>
              <Input id="familyInfo.email" name="familyInfo.email" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="familyInfo.numberOfChildren">Number of Children</Label>
              <Input id="familyInfo.numberOfChildren" name="familyInfo.numberOfChildren" type="number" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="familyInfo.childrenAges">Ages of Children</Label>
              <Input id="familyInfo.childrenAges" name="familyInfo.childrenAges" placeholder="e.g. 5, 8, 12" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Father's Income */}
      <IncomeSection title="Father's Income" prefix="fatherIncome" />

      {/* Mother's Income */}
      <IncomeSection title="Mother's Income" prefix="motherIncome" />

      {/* Expenses: Income Taxes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" />
            Income Taxes
          </CardTitle>
          <CardDescription>Report for current and prior tax year.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="text-sm font-medium">Tax Type</div>
            <div className="text-sm font-medium">Current Year</div>
            <div className="text-sm font-medium">Prior Year</div>
          </div>
          {[
            { label: "Federal", key: "federal" },
            { label: "State", key: "state" },
            { label: "FICA / Self-Employment", key: "fica" },
            { label: "Other", key: "other" },
          ].map(({ label, key }) => (
            <div key={key} className="grid grid-cols-3 gap-4 mb-3">
              <Label className="self-center text-sm">{label}</Label>
              <Input
                name={`expenses.tax.${key}Current`}
                type="number"
                step="0.01"
                placeholder="$0.00"
              />
              <Input
                name={`expenses.tax.${key}Prior`}
                type="number"
                step="0.01"
                placeholder="$0.00"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Expenses: Housing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Home className="h-4 w-4" />
            Housing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="housingType"
                  value="rent"
                  checked={housingType === "rent"}
                  onChange={() => setHousingType("rent")}
                  className="accent-primary"
                />
                <span className="text-sm">Rent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="housingType"
                  value="own"
                  checked={housingType === "own"}
                  onChange={() => setHousingType("own")}
                  className="accent-primary"
                />
                <span className="text-sm">Own</span>
              </label>
            </div>

            {housingType === "rent" ? (
              <div className="space-y-1.5">
                <Label htmlFor="expenses.housing.monthlyRent">Monthly Rent</Label>
                <Input
                  id="expenses.housing.monthlyRent"
                  name="expenses.housing.monthlyRent"
                  type="number"
                  step="0.01"
                  placeholder="$0.00"
                />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Monthly Mortgage Payment</Label>
                  <Input name="expenses.housing.mortgagePayment" type="number" step="0.01" placeholder="$0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Annual Property Tax</Label>
                  <Input name="expenses.housing.propertyTax" type="number" step="0.01" placeholder="$0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Annual Home Insurance</Label>
                  <Input name="expenses.housing.homeInsurance" type="number" step="0.01" placeholder="$0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Estimated Market Value</Label>
                  <Input name="expenses.housing.marketValue" type="number" step="0.01" placeholder="$0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Outstanding Loan Balance</Label>
                  <Input name="expenses.housing.loanBalance" type="number" step="0.01" placeholder="$0.00" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Household Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Household Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Clothing", name: "expenses.household.clothing" },
              { label: "Food / Groceries", name: "expenses.household.food" },
              { label: "Household Help", name: "expenses.household.householdHelp" },
              { label: "Medical / Dental", name: "expenses.household.medical" },
            ].map(({ label, name }) => (
              <div key={name} className="space-y-1.5">
                <Label>{label}</Label>
                <Input name={name} type="number" step="0.01" placeholder="$0.00" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Utilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Utilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Gas", name: "expenses.utilities.gas" },
              { label: "Electric", name: "expenses.utilities.electric" },
              { label: "Water", name: "expenses.utilities.water" },
              { label: "Phone / Internet", name: "expenses.utilities.phone" },
            ].map(({ label, name }) => (
              <div key={name} className="space-y-1.5">
                <Label>{label}</Label>
                <Input name={name} type="number" step="0.01" placeholder="$0.00" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automobile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Car className="h-4 w-4" />
            Automobile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input name="expenses.auto.year" placeholder="2020" />
            </div>
            <div className="space-y-1.5">
              <Label>Make</Label>
              <Input name="expenses.auto.make" placeholder="Toyota" />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input name="expenses.auto.model" placeholder="Camry" />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Repairs / Maintenance</Label>
              <Input name="expenses.auto.repairs" type="number" step="0.01" placeholder="$0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Loan Payment</Label>
              <Input name="expenses.auto.loanPayment" type="number" step="0.01" placeholder="$0.00" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scholarship Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Scholarship Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="request.affordableAmount">
                  Amount You Can Afford (annual)
                </Label>
                <Input
                  id="request.affordableAmount"
                  name="request.affordableAmount"
                  type="number"
                  step="0.01"
                  placeholder="$0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="request.requestedAmount">
                  Scholarship Amount Requested
                </Label>
                <Input
                  id="request.requestedAmount"
                  name="request.requestedAmount"
                  type="number"
                  step="0.01"
                  placeholder="$0.00"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="request.reason">
                Please explain why you are requesting financial assistance
              </Label>
              <Textarea
                id="request.reason"
                name="request.reason"
                rows={5}
                placeholder="Describe your family's financial situation and why you need tuition assistance..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">References</CardTitle>
          <CardDescription>Please provide two personal references.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2].map((num) => (
              <div key={num} className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Reference {num}</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input name={`ref${num}.name`} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input name={`ref${num}.phone`} type="tel" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Relationship</Label>
                    <Input name={`ref${num}.relationship`} placeholder="e.g. Rabbi, Friend" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Certification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={certified}
                onCheckedChange={(checked: boolean) => setCertified(checked)}
                id="certified"
              />
              <label htmlFor="certified" className="text-sm leading-relaxed cursor-pointer">
                I certify that all information provided in this application is true and accurate
                to the best of my knowledge. I understand that false or misleading information
                may result in the denial or revocation of financial assistance. I authorize
                JETS School to verify any information provided in this application.
              </label>
            </div>

            {message && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  message.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                    : "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={isPending || !certified} className="w-full sm:w-auto">
              {isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              Submit Scholarship Application
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

// ==================== Reusable Income Section ====================
function IncomeSection({ title, prefix }: { title: string; prefix: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription>Report annual amounts. Include tax return if possible.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Occupation</Label>
            <Input name={`${prefix}.occupation`} />
          </div>
          <div className="space-y-1.5">
            <Label>Employer</Label>
            <Input name={`${prefix}.employer`} />
          </div>
          <div className="space-y-1.5">
            <Label>Annual Gross Salary</Label>
            <Input name={`${prefix}.annualGrossSalary`} type="number" step="0.01" placeholder="$0.00" />
          </div>
          <div className="space-y-1.5">
            <Label>Checking / Savings Accounts</Label>
            <Input name={`${prefix}.checkingSavings`} type="number" step="0.01" placeholder="$0.00" />
          </div>
          <div className="space-y-1.5">
            <Label>Investment Income</Label>
            <Input name={`${prefix}.investmentIncome`} type="number" step="0.01" placeholder="$0.00" />
          </div>
          <div className="space-y-1.5">
            <Label>Business Income</Label>
            <Input name={`${prefix}.businessIncome`} type="number" step="0.01" placeholder="$0.00" />
          </div>
          <div className="space-y-1.5">
            <Label>Rental Income</Label>
            <Input name={`${prefix}.rentalIncome`} type="number" step="0.01" placeholder="$0.00" />
          </div>
          <div className="space-y-1.5">
            <Label>Other Sources of Income</Label>
            <Input name={`${prefix}.otherIncome`} type="number" step="0.01" placeholder="$0.00" />
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            Tax return upload will be available soon. For now, please bring copies to your interview.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
