"""
OCRBookor - Métriques de Qualité Réelles (CER, WER, Confiance)
Ne calcule CER et WER que lorsqu'une transcription de référence certifiée existe.
"""

from typing import List, Optional, Dict, Any

def levenshtein_distance(s1: str, s2: str) -> int:
    """Distance d'édition standard de Levenshtein entre deux chaînes"""
    m, n = len(s1), len(s2)
    if m == 0: return n
    if n == 0: return m

    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)

    return dp[m][n]

def calculate_cer(recognized_text: str, reference_text: str) -> Optional[float]:
    """
    Taux d'erreur caractère (CER) = Levenshtein(rec, ref) / len(ref)
    Retourne None si la référence est vide ou absente.
    """
    if not reference_text:
        return None
    dist = levenshtein_distance(recognized_text, reference_text)
    return round((dist / len(reference_text)) * 100, 2)

def calculate_wer(recognized_text: str, reference_text: str) -> Optional[float]:
    """
    Taux d'erreur mot (WER) = Levenshtein sur les tokens de mots / nb mots ref
    Retourne None si la référence est vide ou absente.
    """
    if not reference_text:
        return None
    rec_words = recognized_text.split()
    ref_words = reference_text.split()
    if not ref_words:
        return None

    # Levenshtein on word lists
    m, n = len(rec_words), len(ref_words)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            cost = 0 if rec_words[i - 1] == ref_words[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)

    return round((dp[m][n] / len(ref_words)) * 100, 2)

def evaluate_quality_metrics(
    raw_text: str,
    confidence: float,
    ground_truth: Optional[str] = None
) -> Dict[str, Any]:
    words = raw_text.split()
    chars_count = len(raw_text)
    word_count = len(words)

    cer = calculate_cer(raw_text, ground_truth) if ground_truth else None
    wer = calculate_wer(raw_text, ground_truth) if ground_truth else None

    return {
        "confidence": confidence,
        "character_count": chars_count,
        "word_count": word_count,
        "has_ground_truth": ground_truth is not None,
        "cer": cer,
        "wer": wer
    }
