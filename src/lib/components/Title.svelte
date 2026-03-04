<script>
  export let text = "Cipher Saga 3.0";
</script>

<style>
  @font-face {
    font-family: "HelloParis";
    src: url("/fonts/Hello Paris Sans Bold.ttf") format("truetype");
    font-weight: normal;
    font-style: normal;
  }

  .cipher-title {
    font-family: "HelloParis", cursive;
    font-size: 4rem;
    text-align: center;
    font-weight: bold;

    background: linear-gradient(to bottom, #fef1fe, #630489);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    position: relative;
    z-index: 10;
  }

  @media (min-width: 768px) {
    .cipher-title {
      font-size: 6rem;
    }
  }

  @media (min-width: 1024px) {
    .cipher-title {
      font-size: 7rem;
    }
  }
</style>

<h2 class="cipher-title">
  {text}
</h2>