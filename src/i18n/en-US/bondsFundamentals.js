export default {
  chapters: {
    introduction_to_bonds: {
      title: 'Introduction to Bonds',
      topics: [
        {
          title: 'What is a Bond?',
          content:
            'A bond is a debt instrument through which an investor lends money to an issuer in exchange for interest payments and repayment of principal.',
        },
        {
          title: 'Why Do Companies and Governments Issue Bonds?',
          content:
            'Companies and governments issue bonds to raise capital for various financing needs.',
        },
        {
          title: 'Lenders vs. Borrowers',
          content: 'The investor is the lender, while the bond issuer is the borrower.',
        },
        {
          title: 'Bonds vs. Stocks',
          content:
            'A bond represents debt owed to the investor, while a stock represents ownership in a company.',
        },
        {
          title: 'Primary vs. Secondary Bond Markets',
          content:
            'In the primary market, bonds are issued by the issuer. In the secondary market, investors trade already-issued bonds.',
        },
      ],
    },

    key_bond_terminology: {
      title: 'Key Bond Terminology',
      topics: [
        {
          title: 'Face Value / Par Value',
          content:
            'Face value is the principal amount typically repaid to the investor at maturity.',
        },
        {
          title: 'Coupon Rate',
          content:
            'The coupon rate determines the interest paid by the bond relative to its face value.',
        },
        {
          title: 'Coupon Payment',
          content: 'A coupon payment is the periodic interest cash flow paid to the bondholder.',
        },
        {
          title: 'Maturity Date',
          content: 'The maturity date is when the principal is normally repaid.',
        },
        {
          title: 'Issue Price',
          content:
            'The issue price is the price at which the bond is initially sold by the issuer.',
        },
        {
          title: 'Market Price',
          content: 'The market price is the current price at which the bond trades.',
        },
        {
          title: 'Yield',
          content: 'Yield measures the return an investor receives relative to the bond price.',
        },
      ],
    },

    how_bonds_work: {
      title: 'How Bonds Work',
      topics: [
        {
          title: 'Cash Flow of a Bond',
          content:
            'A typical bond generates periodic coupon payments and repayment of principal at maturity.',
        },
        {
          title: 'Fixed vs. Floating Coupons',
          content:
            'A fixed coupon remains constant, while a floating coupon changes based on a reference interest rate.',
        },
        {
          title: 'Coupon Payment Frequency',
          content:
            'Coupons may be paid annually, semi-annually, quarterly, or at another specified frequency.',
        },
        {
          title: 'Maturity and Principal Repayment',
          content: "At maturity, the issuer normally repays the bond's face value.",
        },
        {
          title: 'Callable and Puttable Bonds',
          content:
            'Callable bonds can be redeemed early by the issuer, while puttable bonds give the investor a right to sell the bond back.',
        },
        {
          title: 'Zero-Coupon Bonds',
          content:
            'Zero-coupon bonds do not make periodic coupon payments and are typically purchased at a discount to face value.',
        },
      ],
    },

    bond_pricing_fundamentals: {
      title: 'Bond Pricing Fundamentals',
      topics: [
        {
          title: 'Relationship Between Price and Yield',
          content: 'Bond price and yield generally move in opposite directions.',
        },
        {
          title: 'Discount Bonds',
          content: 'A bond trading below face value is trading at a discount.',
        },
        {
          title: 'Premium Bonds',
          content: 'A bond trading above face value is trading at a premium.',
        },
        {
          title: 'Par Bonds',
          content: 'A par bond trades at a price equal to its face value.',
        },
        {
          title: 'Present Value of Bond Cash Flows',
          content: 'A bond price is the present value of its future coupon payments and principal.',
        },
        {
          title: 'Basic Bond Pricing Formula',
          content: 'The price of a bond is calculated by discounting its future cash flows.',
          formula: 'Bond Price = PV(Coupon Payments) + PV(Face Value)',
        },
        {
          title: 'Worked Pricing Example',
          content:
            'A worked pricing example shows how coupon, maturity, and required yield determine market value.',
        },
      ],
    },

    understanding_bond_yields: {
      title: 'Understanding Bond Yields',
      topics: [
        {
          title: 'Current Yield',
          content:
            'Current yield compares the annual coupon payment with the current market price.',
          formula: 'Current Yield = Annual Coupon / Market Price',
        },
        {
          title: 'Yield to Maturity (YTM)',
          content:
            'YTM estimates the annual return if the bond is held to maturity and payments occur as specified.',
        },
        {
          title: 'Yield to Call (YTC)',
          content: 'YTC measures the return if a callable bond is redeemed early.',
        },
        {
          title: 'Yield to Worst',
          content:
            'Yield to Worst represents the lowest applicable yield across redemption or maturity scenarios.',
        },
        {
          title: 'Nominal Yield vs. Effective Yield',
          content:
            'Nominal yield does not fully reflect compounding frequency, while effective yield accounts for it.',
        },
        {
          title: 'Worked Yield Examples',
          content: 'Worked examples help distinguish the different bond yield measures.',
        },
      ],
    },

    interest_rates_and_bonds: {
      title: 'Interest Rates and Bonds',
      topics: [
        {
          title: 'Why Bond Prices Move',
          content:
            'Changes in market interest rates change the relative attractiveness of existing bonds.',
        },
        {
          title: 'Interest Rate Risk',
          content:
            "Interest rate risk is the risk that a bond's value changes when market interest rates change.",
        },
        {
          title: 'Duration Intuition',
          content: "Duration helps estimate a bond's price sensitivity to changes in yield.",
        },
        {
          title: 'Short-Term vs. Long-Term Bonds',
          content: 'Longer-term bonds are generally more sensitive to changes in interest rates.',
        },
        {
          title: 'Yield Curve Basics',
          content:
            'The yield curve shows yields across different maturities for bonds with comparable credit quality.',
        },
        {
          title: 'Normal, Flat, and Inverted Yield Curves',
          content:
            'Normal, flat, and inverted curves represent different interest-rate structures.',
        },
      ],
    },

    bond_risks: {
      title: 'Bond Risks',
      topics: [
        {
          title: 'Credit / Default Risk',
          content: 'The risk that the issuer fails to make required payments.',
        },
        {
          title: 'Interest Rate Risk',
          content: 'The risk of price changes caused by changes in market interest rates.',
        },
        {
          title: 'Reinvestment Risk',
          content: 'The risk that future coupon payments can only be reinvested at lower rates.',
        },
        {
          title: 'Inflation Risk',
          content: 'The risk that inflation reduces the real purchasing power of future payments.',
        },
        {
          title: 'Liquidity Risk',
          content:
            'The risk that a bond cannot be sold quickly without a significant price concession.',
        },
        {
          title: 'Call Risk',
          content: 'The risk that the issuer redeems the bond before maturity.',
        },
        {
          title: 'Currency Risk',
          content:
            'The risk that exchange-rate movements affect returns for an investor using another currency.',
        },
      ],
    },

    credit_quality_and_ratings: {
      title: 'Credit Quality and Ratings',
      topics: [
        {
          title: 'What Are Credit Ratings?',
          content:
            "Credit ratings assess creditworthiness and the issuer's ability to meet its obligations.",
        },
        {
          title: 'Investment Grade vs. High Yield',
          content:
            'Investment-grade bonds have higher credit quality, while high-yield bonds carry greater credit risk.',
        },
        {
          title: 'Understanding Rating Scales',
          content: 'Rating scales classify issuers and bonds according to credit risk.',
        },
        {
          title: 'Credit Spreads',
          content:
            'A credit spread is the additional yield over a benchmark bond that compensates investors for credit risk.',
        },
        {
          title: 'Government vs. Corporate Credit Risk',
          content: 'Government and corporate bonds have different credit-risk characteristics.',
        },
      ],
    },

    types_of_bonds: {
      title: 'Types of Bonds',
      topics: [
        {
          title: 'Government Bonds',
          content: 'Bonds issued by governments.',
        },
        {
          title: 'Corporate Bonds',
          content: 'Debt securities issued by companies.',
        },
        {
          title: 'Municipal Bonds',
          content: 'Bonds issued by municipalities or other local authorities.',
        },
        {
          title: 'Treasury Bills, Notes, and Bonds',
          content: 'Government debt instruments with different maturities.',
        },
        {
          title: 'Inflation-Linked Bonds',
          content: 'Bonds whose payments or principal are linked to an inflation index.',
        },
        {
          title: 'Convertible Bonds',
          content: 'Bonds that can, under specified conditions, be converted into shares.',
        },
        {
          title: 'High-Yield Bonds',
          content: 'Higher-yield bonds generally associated with greater credit risk.',
        },
      ],
    },

    bond_market_basics: {
      title: 'Bond Market Basics',
      topics: [
        {
          title: 'Primary Market',
          content: 'The market where new bonds are issued and sold for the first time.',
        },
        {
          title: 'Secondary Market',
          content: 'The market where already-issued bonds are traded between investors.',
        },
        {
          title: 'How Bonds Are Traded',
          content: 'Investors buy and sell bonds at changing market prices and yields.',
        },
        {
          title: 'Bid and Ask Prices',
          content:
            'Bid is the price a buyer offers, while ask is the price at which a seller is willing to sell.',
        },
        {
          title: 'Accrued Interest',
          content:
            'Accrued interest is coupon interest accumulated since the last coupon payment date.',
        },
        {
          title: 'Clean vs. Dirty Price',
          content: 'Clean price excludes accrued interest, while dirty price includes it.',
        },
      ],
    },

    practical_bond_analysis: {
      title: 'Practical Bond Analysis',
      topics: [
        {
          title: 'Reading a Bond Quote',
          content: 'Learn how to read price, coupon, maturity, and yield from a bond quote.',
        },
        {
          title: 'Comparing Two Bonds',
          content: 'Compare bonds by yield, maturity, credit quality, and risk.',
        },
        {
          title: 'Evaluating Yield vs. Risk',
          content: 'Higher yield is often compensation for taking greater risk.',
        },
        {
          title: 'Analyzing Maturity',
          content:
            'Maturity affects interest-rate sensitivity and the time until principal repayment.',
        },
        {
          title: 'Analyzing Credit Quality',
          content: "Assess the issuer's ability to meet its debt obligations.",
        },
        {
          title: 'Basic Bond Investment Checklist',
          content: 'Check yield, price, coupon, maturity, credit risk, liquidity, and bond terms.',
        },
      ],
    },

    putting_it_all_together: {
      title: 'Putting It All Together',
      topics: [
        {
          title: 'Complete Bond Valuation Example',
          content:
            "Combine coupon, face value, maturity, and required yield to calculate a bond's value.",
        },
        {
          title: 'Price-Yield Scenario Analysis',
          content: "Examine how different yield levels change the bond's price.",
        },
        {
          title: 'How Rate Changes Affect Bond Prices',
          content:
            'Rising market rates generally put downward pressure on existing fixed-rate bond prices.',
        },
        {
          title: 'Choosing Between Different Bonds',
          content:
            'Compare bonds based on yield, risk, maturity, credit quality, and investment objectives.',
        },
        {
          title: 'Common Beginner Mistakes',
          content:
            'Avoid looking only at coupon rate or yield without considering price and risks.',
        },
        {
          title: 'Final Knowledge Check',
          content:
            'Test your understanding of the core concepts through questions and practical exercises.',
        },
      ],
    },
  },
}
