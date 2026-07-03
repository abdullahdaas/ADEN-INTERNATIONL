const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newCode = `
  // Fetch user specific data on user change
  useEffect(() => {
    if (user?.role === 'citizen' && user.emailOrPhone) {
      // Fetch user's own properties
      fetchProperties({ isApproved: 'all' }).then(props => {
        const myProps = props.filter(p => p.ownerEmailOrPhone && p.ownerEmailOrPhone.toLowerCase() === user.emailOrPhone.toLowerCase());
        setCitizenSubmittedProps(myProps);
      }).catch(console.error);
    } else if (!user) {
      setCitizenSubmittedProps([]);
    }
  }, [user]);

  const loadData = async () => {
`;

code = code.replace(/const loadData = async \(\) => \{/g, newCode.trim());

fs.writeFileSync('src/App.tsx', code);
