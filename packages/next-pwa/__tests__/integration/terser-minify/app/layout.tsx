const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head />
    <body>
      <main>{children}</main>
    </body>
  </html>
);

export default RootLayout;
