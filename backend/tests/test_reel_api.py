# Reel narration + TTS voice-over endpoint tests (v2: 11 lines)
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


@pytest.fixture
def s():
    return requests.Session()


# Narration metadata
class TestNarration:
    def test_en_lines(self, s):
        r = s.get(f"{BASE_URL}/api/reel/narration", params={"lang": "en"})
        assert r.status_code == 200
        d = r.json()
        assert d["lang"] == "en"
        assert len(d["lines"]) == 11
        for i, l in enumerate(d["lines"]):
            assert l["i"] == i
            assert isinstance(l["t"], (int, float))
            assert isinstance(l["text"], str) and l["text"]
            assert l["url"] == f"/api/reel/vo/en/{i}.mp3"
        assert d["lines"][0]["text"] == "Most work asks for attention."
        ts = [l["t"] for l in d["lines"]]
        assert ts == [4.6, 7.2, 9.2, 14.0, 21.6, 29.6, 37.4, 41.6, 45.4, 52.8, 56.0]
        assert d["lines"][10]["text"] == "Just a creative guy."

    def test_default_lang_en(self, s):
        r = s.get(f"{BASE_URL}/api/reel/narration")
        assert r.status_code == 200
        assert r.json()["lang"] == "en"

    def test_pt_lines(self, s):
        r = s.get(f"{BASE_URL}/api/reel/narration", params={"lang": "pt"})
        assert r.status_code == 200
        d = r.json()
        assert len(d["lines"]) == 11
        assert d["lines"][0]["text"] == "A maioria do trabalho pede atenção."
        assert d["lines"][10]["url"] == "/api/reel/vo/pt/10.mp3"
        assert [l["t"] for l in d["lines"]] == [4.6, 7.2, 9.2, 14.0, 21.6, 29.6, 37.4, 41.6, 45.4, 52.8, 56.0]

    def test_unknown_lang(self, s):
        r = s.get(f"{BASE_URL}/api/reel/narration", params={"lang": "fr"})
        assert r.status_code == 404
        assert "detail" in r.json()


# Voice-over audio files
class TestVO:
    @pytest.mark.parametrize("lang,idx", [("en", 0), ("en", 9), ("en", 10), ("pt", 0), ("pt", 9), ("pt", 10)])
    def test_vo_ok(self, s, lang, idx):
        r = s.get(f"{BASE_URL}/api/reel/vo/{lang}/{idx}.mp3", timeout=60)
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("audio/mpeg")
        assert len(r.content) > 2000
        # mp3: ID3 tag or MPEG frame sync
        assert r.content[:3] == b"ID3" or (r.content[0] == 0xFF and (r.content[1] & 0xE0) == 0xE0)

    @pytest.mark.parametrize("path", ["en/99.mp3", "en/11.mp3", "pt/11.mp3", "en/-1.mp3", "fr/0.mp3"])
    def test_vo_404(self, s, path):
        r = s.get(f"{BASE_URL}/api/reel/vo/{path}")
        assert r.status_code == 404

    def test_vo_non_int(self, s):
        r = s.get(f"{BASE_URL}/api/reel/vo/en/abc.mp3")
        assert r.status_code in (404, 422)

