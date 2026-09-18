# PSIR 401-Short Assignment 5

### Burak Çizmecioğlu

---

library(readxl) library(dplyr) library(tidyr) library(knitr) library(kableExtra) library(ggplot2) library(scales)

df <- read_excel("/Users/burak/Desktop/assignment5.xlsx")

Question 1

Tabulate in turn the anger towards the Supreme Election Council (f1101) [1 “No Anger”, 5 “ALot of Anger toward the SEC”] and probability of voting [0 “Definitely not voting”, 10 “Definitely voting” in the June 23 elections (e03) variables (10 pts).

---

# Anger toward SEC f1101_labels <- c("1" = "No Anger", "2" = "2", "3" = "3", "4" = "4", "5" = "A Lot of Anger", "99" = "Don't Know/No Answer")

f1101_raw <- as.data.frame(table(Value = df$f1101, useNA = "ifany")) %>% rename(Frequency = Freq) %>% mutate( Label = recode(as.character(Value), !!!f1101_labels, .default = ↪ as.character(Value)), Percent = round(Frequency / sum(Frequency) * 100, 2), `Cum. %` = round(cumsum(Percent), 2) ) %>% select(Value, Label, Frequency, Percent, `Cum. %`)

---

1


---

---

f1101_raw %>% kbl(caption = "f1101 – Anger toward the Supreme Election Council (1=No ↪ Anger … 5=A Lot of Anger)", booktabs = TRUE) %>% kable_styling(latex_options = c("striped", "hold_position", "scale_down"), ↪ position = "center", font_size = 11) %>% row_spec(0, bold = TRUE)

Table 1: f1101 – Anger toward the Supreme Election Council (1=No Anger … 5=A Lot of Anger)

---

**Value Label**

**Frequency Percent Cum. %**

| 1 | No Anger | 365 | 35.82 | 35.82 |
| --- | --- | --- | --- | --- |
| 22363.5339.35 |
| 3 | 3 | 72 | 7.07 | 46.42 |
| 4413112.8659.28 |
| 5 | A Lot of Anger | 390 | 38.27 | 97.55 |
| 99 | Don’t Know/No Answer | 25 | 2.45 | 100.00 |

---

# Probability of Voting e03_labels <- c("0" = "Definitely Not Voting", "10" = "Definitely Voting", ↪ "99" = "Don't Know/No Answer")

e03_raw <- as.data.frame(table(Value = df$e03, useNA = "ifany")) %>% rename(Frequency = Freq) %>% mutate( Label = recode(as.character(Value), !!!e03_labels, .default = ↪ as.character(Value)), Percent = round(Frequency / sum(Frequency) * 100, 2), `Cum. %` = round(cumsum(Percent), 2) ) %>% select(Value, Label, Frequency, Percent, `Cum. %`)

e03_raw %>% kbl(caption = "e03 – Probability of Voting in June 23 Elections ↪ (0=Definitely Not … 10=Definitely)", booktabs = TRUE) %>% kable_styling(latex_options = c("striped", "hold_position", "scale_down"), ↪ position = "center", font_size = 11) %>% row_spec(0, bold = TRUE)

2


---

Table 2: e03 – Probability of Voting in June 23 Elections (0=Definitely Not … 10=Definitely)

---

**Value Label**

**Frequency Percent Cum. %**

| 0 | Definitely Not Voting | 32 | 3.14 | 3.14 |
| --- | --- | --- | --- | --- |
| 11100.984.12 |
| 2 | 2 | 5 | 0.49 | 4.61 |
| 3330.294.90 |
| 4 | 4 | 1 | 0.10 | 5.00 |
| 55313.048.04 |
| 6 | 6 | 23 | 2.26 | 10.30 |
| 77222.1612.46 |
| 8 | 8 | 57 | 5.59 | 18.05 |
| 99393.8321.88 |
| 10 | Definitely Voting | 759 | 74.48 | 96.36 |
| 99 | Don’t Know/No Answer | 37 | 3.63 | 99.99 |

### **Question 2-3**

After recoding missing (i.e., inappropriate response options) data as “system missing” for both variables [99 “Don’t know/No answer”], conduct a chi-squared test (10 pts).

Find out the critical �2 value, and explain whether the association of anger towards the Supreme Election Council decision and the probability of turning out to vote are associated with each other (10 pts).

---

df <- df %>% mutate( f1101_clean = if_else(f1101 == 99, NA_real_, f1101), e03_clean = if_else(e03 == 99, NA_real_, e03) )

cross_tab <- table(`f1101 (Anger->SEC)` = df$f1101_clean, `e03 (Prob.Vote)` ↪ = df$e03_clean, useNA = "no")

# ÖNCE: Ki-kare testini çalıştırıp nesneyi oluşturuyoruz chi_result <- chisq.test(cross_tab)

# SONRA: Oluşan nesnenin içinden parametreleri çekiyoruz df_chi <- chi_result$parameter alpha <- 0.05 chi_crit <- qchisq(1 - alpha, df = df_chi)

---

3


---

---

# Tablo oluşturma kısmı aynen kalıyor data.frame( Statistic = c("Observed Chi-Squared", "Degrees of Freedom", "Critical ↪ Chi-Squared (alpha = 0.05)", "p-value"), Value = c(round(chi_result$statistic, 3), df_chi, round(chi_crit, 3), ↪ format.pval(chi_result$p.value, digits = 3)) ) %>% kbl(caption = "Chi-squared Test: Anger toward SEC and Probability of ↪ Voting", booktabs = TRUE) %>% kable_styling(latex_options = c("striped", "hold_position", "scale_down"), ↪ position = "center", font_size = 11) %>% row_spec(0, bold = TRUE)

Table 3: Chi-squared Test: Anger toward SEC and Probability of Voting

---

### **Statistic**

**Value**

| Observed Chi-Squared | 83.367 |
| --- | --- |
| Degrees of Freedom 40 |
| Degrees of Freedom 40 Critical Chi-Squared (alpha = 0.05) 55.758 | 55.758 |
| p-value | 6.95e-05 |

**Interpretation:** Our calculated Chi-squared value is**83.37**, which is much bigger than the critical value of** 55.76**. Also, the p-value is very close to zero (𝑝 < 0.001).

This means we reject the null hypothesis. There is a** real connection** between anger toward the SEC and the chance of voting. Simply put, people who are angrier about the situation are much more motivated to go and vote.

### **Question 4**

Cross-tabulate the parties that the respondents find themselves closest to (c01) and the probability to vote for Ekrem ˙ Imamo˘glu (e0402) variables [0 “Definitely would not vote”, 10 “Definitely would vote”] variables (10 pts).

---

party_labels <- c("1" = "AK Parti", "2" = "CHP", "3" = "HDP", "4" = "IYI ↪ Party", "5" = "MHP", "6" = "SP", "90" = "Other", "96" = "None / No ↪ Party", "99" = "DK / NA")

df <- df %>% mutate(c01_label = recode(as.character(c01), !!!party_labels, .default = ↪ "Other"))

4


---

---

cross_tab_q4 <- table(`c01 (Party)` = df$c01_label, `e0402 (Prob->İmamoğlu)` ↪ = df$e0402, useNA = "ifany")

### cross_tab_q4 %>%as.data.frame.matrix() %>%

kbl(caption = "Party Closest to Self by Probability to Vote for Imamoglu ↪ (Raw)", booktabs = TRUE) %>% kable_styling(latex_options = c("striped", "hold_position", "scale_down"), ↪ position = "center", font_size = 9) %>%

### row_spec(0, bold = TRUE)

Table 4: Party Closest to Self by Probability to Vote for Imamoglu (Raw)

---

### **0**

**1**

**2 3 4**

**5 6 7**

**8 9 10 99**

| AK Parti | 288 | 55 | 12 | 7 | 5 | 4 | 4 | 1 | 2 | 0 | 10 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CHP200115111173572 |
| DK / NA | 1 | 0 | 3 | 0 | 0 | 3 | 0 | 1 | 3 | 0 | 4 | 2 |
| HDP6000030100601 |
| IYI Party | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 1 | 11 | 2 |
| MHP2344000001030 |
| None / No Party | 12 | 1 | 6 | 2 | 1 | 11 | 5 | 0 | 5 | 0 | 23 | 18 |
| Other100000000012 |
| SP | 5 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |

### **Question 5**

Generate a 3-category (trichotomous) variable entitled “pid” (Party ID), where those who find the Justice and Development Party (AK Parti) or the Nationalist Action Party (MHP) closest to themselves score 1, those who find the Republican People’s Party (CHP), the Good Party (IYI), or the Felicity Party (SP) closest score 2, and those who find the People’s Democratic Party (HDP) closest score 3, while all other response categories are coded as missing (10 pts).

---

### df <- df %>%mutate(pid = case_when(c01 %in% c(1, 5) ~ 1, c01 %in% c(2, 4, 6) ~ 2, c01 == 3 ~ 3, TRUE ~ NA_real_

# AK Parti or MHP# CHP, SP, IYI# HDP

),

### pid_label = case_when(

5


---

---

pid == 1 ~ "AKP / MHP", pid == 2 ~ "CHP / IYI / SP", pid == 3 ~ "HDP", TRUE ~ NA_character_ ) )

pid_tab <- as.data.frame(table(pid = df$pid_label, useNA = "ifany")) %>% rename(Frequency = Freq)

pid_tab %>% kbl(caption = "Trichotomous Party ID Variable (pid)", booktabs = TRUE) %>% kable_styling(latex_options = c("striped", "hold_position", "scale_down"), ↪ position = "center", font_size = 11) %>% row_spec(0, bold = TRUE)

Table 5: Trichotomous Party ID Variable (pid)

---

### **pid**

**Frequency**

| AKP / MHP | 430 |
| --- | --- |
| CHP / IYI / SP413 |
| HDP | 71 |
| NA | 105 |

### **Question 6**

After recoding inappropriate/invalid probability to vote for Ekrem ˙ Imamo˘glu data (e0402) as (system) missing, report its mean, standard deviation, and frequency (N) for all three groups you coded in the previous step.

---

df <- df %>% mutate(e0402_clean = if_else(e0402 == 99, NA_real_, e0402))

desc_q6 <- df %>% filter(!is.na(pid)) %>% group_by(`Party ID` = pid_label) %>% summarise( Mean = round(mean(e0402_clean, na.rm = TRUE), 3), SD = round(sd(e0402_clean, na.rm = TRUE), 3), N = sum(!is.na(e0402_clean)), .groups = "drop"

6


---

---

)

desc_q6 %>% kbl(caption = "Probability to Vote for Imamoglu by Party ID", booktabs = ↪ TRUE) %>% kable_styling(latex_options = c("striped", "hold_position", "scale_down"), ↪ position = "center", font_size = 11) %>% row_spec(0, bold = TRUE)

Table 6: Probability to Vote for Imamoglu by Party ID

---

### **Party ID**

**Mean**

**SD**

**N**

| AKP / MHP | 0.797 | 2.055 | 423 |
| --- | --- | --- | --- |
| CHP / IYI / SP9.5931.603408 |
| HDP | 8.886 | 2.942 | 70 |

### **Question 7**

Generate a binary variable (either from the pid or c01 variables), where the HDP supporters score 1, and the People’s Alliance (i.e., AK Parti and MHP) supporters score 0. Assuming equal variances, explain whether the difference in their mean probabilities to vote for Ekrem ˙ Imamo˘glu is significant and what the t-test produces differently from the descriptive statistics you presented in response to the previous question.

---

df <- df %>% mutate( hdp_vs_pa = case_when( pid == 3 ~ 1, # HDP pid == 1 ~ 0, # People's Alliance TRUE ~ NA_real_ ) )

q7_data <- df %>% filter(!is.na(hdp_vs_pa) & !is.na(e0402_clean)) ttest_eq <- t.test(e0402_clean ~ hdp_vs_pa, data = q7_data, var.equal = TRUE)

# T-test in kable data.frame( Statistic = c("Mean (People's Alliance = 0)", "Mean (HDP = 1)", "Mean ↪ difference", "t-statistic", "Degrees of freedom", "p-value", "95% CI ↪ (lower)", "95% CI (upper)"),

7


---

---

Value = c(round(ttest_eq$estimate[1], 3), round(ttest_eq$estimate[2], ↪ 3), round(ttest_eq$estimate[1] - ttest_eq$estimate[2], 3), ↪ round(ttest_eq$statistic, 3), round(ttest_eq$parameter, 2), ↪ format.pval(ttest_eq$p.value, digits = 3), round(ttest_eq$conf.int[1], ↪ 3), round(ttest_eq$conf.int[2], 3)) ) %>% kbl(caption = "Equal Variances t-test: Probability to Vote for Imamoglu", ↪ booktabs = TRUE) %>% kable_styling(latex_options = c("striped", "hold_position", "scale_down"), ↪ position = "center", font_size = 11) %>% row_spec(0, bold = TRUE)

Table 7: Equal Variances t-test: Probability to Vote for Imamoglu

---

### **Statistic**

**Value**

| Mean (People’s Alliance = 0) | 0.797 |
| --- | --- |
| Mean (HDP = 1)8.886 |
| Mean difference | -8.089 |
| t-statistic-28.476 |
| Degrees of freedom | 491 |
| p-value<2e-16 |
| 95% CI (lower) | -8.647 |
| 95% CI (upper) | -7.531 |

**Interpretation:**

Simple averages only show the basic numbers, but they cannot prove if a difference is real or just a coincidence. The t-test checks if the gap between the two groups is actually important by looking at the sample size and variation.

Here, the average look at voting for İmamoğlu is** 0.80** for People’s Alliance fans and** 8.89** for HDP fans. This** 8.09-point gap** is highly significant (𝑡 = −28.48, 𝑝 < 0.001). The test proves this big difference is a real fact, not random luck.

### **Additional visualization**

---

q7_data %>% mutate(`Party group` = factor( hdp_vs_pa, levels = c(0, 1), labels = c("People's Alliance", "HDP")

8


---

---

)) %>% ggplot(aes(x = `Party group`, y = e0402_clean, fill = `Party group`)) + geom_boxplot(alpha = 0.75, na.rm = TRUE) + labs( x = NULL, y = "Probability of voting for İmamoğlu (0–10)" ) + scale_y_continuous(breaks = 0:10, limits = c(0, 10)) + theme_minimal() + theme(legend.position = "none")

---

---

> **ℹ Note**
>
> 10987654321 Probability of voting for .mamo.lu (0−10) 0 People's Alliance HDP

Figure 1: Probability of voting for İmamoğlu by party group

### **Question 8**

Conduct a t-test assuming unequal variances, and briefly explain what the mean probabilities for those two groups of respondents and their difference suggest (10 pts).

---

ttest_uneq <- t.test(e0402_clean ~ hdp_vs_pa, data = q7_data, var.equal = ↪ FALSE)

---

9


---

---

data.frame( Statistic = c("Mean (People's Alliance = 0)", "Mean (HDP = 1)", "Mean ↪ difference", "t-statistic", "Degrees of freedom", "p-value", "95% CI ↪ (lower)", "95% CI (upper)"), Value = c(round(ttest_uneq$estimate[1], 3), ↪ round(ttest_uneq$estimate[2], 3), round(ttest_uneq$estimate[1] - ↪ ttest_uneq$estimate[2], 3), round(ttest_uneq$statistic, 3), ↪ round(ttest_uneq$parameter, 2), format.pval(ttest_uneq$p.value, digits ↪ = 3), round(ttest_uneq$conf.int[1], 3), round(ttest_uneq$conf.int[2], ↪ 3)) ) %>% kbl(caption = "Unequal Variances t-test", booktabs = TRUE) %>% kable_styling(latex_options = c("striped", "hold_position", "scale_down"), ↪ position = "center", font_size = 11) %>% row_spec(0, bold = TRUE)

Table 8: Unequal Variances t-test

---

### **Statistic**

**Value**

| Mean (People’s Alliance = 0) | 0.797 |
| --- | --- |
| Mean (HDP = 1)8.886 |
| Mean difference | -8.089 |
| t-statistic-22.13 |
| Degrees of freedom | 80.51 |
| p-value<2e-16 |
| 95% CI (lower) | -8.816 |
| 95% CI (upper) | -7.362 |

**Interpretation:** The Welch t-test gives the exact same result even without assuming equal variations (𝑡 = −22.13, 𝑝 < 0.001).

This shows clear** strategic voting**. Even though HDP voters do not share the same political ideas with the CHP, they almost completely voted for İmamoğlu to stand against the AKP-MHP alliance.

### **Question 9**

After recoding the “Don’t Know/No Answer” category as missing for the probability to vote for Binali Yıldırım variable (e0401), generate a dichotomous variable entitled “akp dum” from the party identification (c05) variable, where those who reported to be an AKParti partisan score 1 and those who reported to be an MHP partisan score 0 (10 pts). Then, calculate the

10


---

mean probabilities of voting for Binali Yıldırım of AK Parti and MHP supporters with varying levels of anger toward the Supreme Election Council (10 pts).

---

df <- df %>% mutate( e0401_clean = if_else(e0401 == 99, NA_real_, e0401), akp_dum = case_when( c05 == 1 ~ 1, # AK Parti partisan c05 == 5 ~ 0, # MHP partisan TRUE ~ NA_real_ ) )

# (Wide Pivot) means_q9 <- df %>% filter(!is.na(akp_dum) & !is.na(f1101_clean) & !is.na(e0401_clean)) %>% group_by(Party = if_else(akp_dum == 1, "Mean (AKP)", "Mean (MHP)"), ↪ f1101_clean) %>% summarise(Mean_e0401 = round(mean(e0401_clean, na.rm = TRUE), 3), .groups = ↪ "drop") %>% tidyr::pivot_wider(names_from = f1101_clean, values_from = Mean_e0401) %>% rename(`Anger toward SEC (1 No, 5 A Lot)` = Party)

means_q9 %>% kbl(caption = "Mean Probability to Vote for Yildirim by Anger toward SEC ↪ and Party", booktabs = TRUE) %>% kable_styling(latex_options = c("striped", "hold_position", "scale_down"), ↪ position = "center", font_size = 11) %>% row_spec(0, bold = TRUE)

Table 9: Mean Probability to Vote for Yildirim by Anger toward SEC and Party

---

**Anger toward SEC (1 No, 5 A Lot)**

**1**

**2**

**3**

**4**

**5**

| Mean (AKP) | 9.727 | 8.739 | 8.955 | 8.621 | 7.211 |
| --- | --- | --- | --- | --- | --- |
| Mean (MHP) | 9.158 | 8.500 | 6.200 | 5.250 | 4.400 |

### **Question 10**

Plot the mean probabilities (as in Figure 7 in the “…Sample Excel File” document and in the previous assignment). Briefly explain what the mean probabilities you calculated and plotted suggest (10 pts).

11


---

---

plot_data <- df %>% filter(!is.na(akp_dum) & !is.na(f1101_clean) & !is.na(e0401_clean)) %>% group_by(f1101_clean, akp_dum) %>% summarise(Mean_e0401 = mean(e0401_clean), .groups = "drop") %>% mutate(Partisanship = factor(akp_dum, levels = c(0, 1), labels = c("MHP ↪ supporters", "AKP supporters")))

p10 <- ggplot(plot_data, aes(x = f1101_clean, y = Mean_e0401, color = ↪ Partisanship, group = Partisanship, shape = Partisanship)) + geom_line(linewidth = 1) + geom_point(size = 3) + scale_x_continuous(name = "Anger toward the Supreme Election Council (1 = ↪ No Anger, 5 = A Lot)", breaks = 1:5) + scale_y_continuous(name = "Mean Probability to Vote for Yildirim (0-10)", ↪ limits = c(0, 10), breaks = seq(0, 10, 2)) + scale_color_manual(values = c("AKP supporters" = "#E69500", "MHP ↪ supporters" = "#B00020")) + # Senin Orijinal Renklerin labs(title = "Mean Probability to Vote for Yildirim", subtitle = "Higher ↪ values indicate stronger intention to vote for Yildirim") + theme_minimal(base_size = 12) + theme(legend.position = "bottom", plot.title = element_text(face = "bold"), ↪ panel.grid.minor = element_blank())

print(p10)

12


---

> **ℹ Note**
>
> Mean Probability to Vote for YildirimHigher values indicate stronger intention to vote for Yildirim 1086420 1 2 3 4 5 Anger toward the Supreme Election Council (1 = No Anger, 5 = A Lot)Mean Probability to Vote for Yildirim (0−10)Partisanship MHP supporters AKP supportersggsave("Q10_mean_prob_plot.png", plot = p10, width = 7, height = 5, dpi = ↪ 150)

**Interpretation:** The line graph shows how anger changes the vote for Binali Yıldırım:

**AK Parti Voters:** They stay very loyal to Yıldırım (scoring between 7 and 10) no matter how angry they are about the SEC. Their party choice did not change at all.

**MHP Voters:** Their support drops quickly. When they have “No Anger” the score is 9.16, but with “A Lot of Anger” it drops to 4.40.

Note: The MHP group is very small (𝑛 = 35) , so this drop might not be 100% reliable.

### **Bonus Question**

Plot histograms (in percentages) of anger toward the Supreme Election Council for both the AK Parti and MHP supporters, and briefly explain what the two plots show (Bonus question– 10 pts).

---

bonus_tab <- df %>% filter(!is.na(akp_dum) & !is.na(f1101_clean)) %>% mutate(Group = factor(akp_dum, levels = c(1, 0), labels = c("AKP ↪ supporters", "MHP supporters"))) %>%

13


---

---

group_by(Group, f1101_clean) %>% summarise(n = n(), .groups = "drop_last") %>% mutate(pct = n / sum(n) * 100) %>% ungroup()

p_bonus <- ggplot(bonus_tab, aes(x = factor(f1101_clean), y = pct, fill = ↪ Group)) + geom_col(show.legend = FALSE, color = "white", width = 0.75) + facet_wrap(~ Group) + scale_fill_manual(values = c("AKP supporters" = "#E69500", "MHP supporters" ↪ = "#B00020")) + # Senin Orijinal Renklerin geom_text(aes(label = paste0(round(pct, 1), "%")), vjust = -0.4, size = 3) ↪ + scale_y_continuous(limits = c(0, max(bonus_tab$pct) * 1.15)) + labs(x = "Anger toward the Supreme Election Council (1 = No Anger, 5 = A ↪ Lot)", y = "Percent of Group (%)", title = "Distribution of Anger toward the Supreme Election Council", ↪ subtitle = "Within-group percentages, by bypassing") + theme_minimal(base_size = 12) + theme(plot.title = element_text(face = "bold"), panel.grid.minor = ↪ element_blank(), strip.text = element_text(face = "bold"))

print(p_bonus)

14


---

---

### Distribution of Anger toward the Supreme Election Council

| AKP supporters | MHP supporters |
| --- | --- |

50

54.3%

---

25

> **ℹ Note**
>
> 6% 6% 7.6%

Percent of Group (%) 0 1 2 3

4

4.9% 5

---

1

2

3

4

5

Anger toward the Supreme Election Council (1 = No Anger, 5 = A Lot)

**Interpretation:** The charts show that AKP and MHP voters felt completely different about

the SEC decision:

**AK Parti Group:** Most of them ( **75.5%** agreed with the decision.

) felt zero anger (Category 1). They completely

**MHP Group:** Only **54.3%** felt zero anger. The rest are spread out, and many felt

medium or high anger.

This means the MHP base had mixed feelings about the decision, while the AKP base was totally happy with it.

15
